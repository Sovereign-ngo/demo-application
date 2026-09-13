(function () {
  const parseJson = (raw) => {
    if (raw === null || raw === undefined || raw === '') return null;
    if (typeof raw === 'object') return raw;
    if (typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const createMemoryBackend = (options) => {
    const config = options && typeof options === 'object' ? options : {};
    const channelName = String(config.channelName || 'sovereign_demo_channel');
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null;
    let state = null;

    const readState = () => state;
    const writeState = (nextState) => { state = nextState; };

    const notify = (payload) => {
      if (channel) {
        try {
          channel.postMessage(payload);
        } catch {
          // no-op
        }
      }

    };

    const subscribe = (listener) => {
      if (typeof listener !== 'function') {
        return function noop() {};
      }

      const onChannel = (event) => {
        const payload = event && event.data ? event.data : { type: 'state-updated', reason: 'broadcast' };
        listener(payload);
      };

      if (channel) {
        channel.addEventListener('message', onChannel);
      }

      return function unsubscribe() {
        if (channel) {
          channel.removeEventListener('message', onChannel);
        }
      };
    };

    return {
      mode: 'memory',
      readState,
      writeState,
      notify,
      subscribe
    };
  };

  const createSolidPodBackend = (options) => {
    const config = options && typeof options === 'object' ? options : {};
    const memoryBackend = createMemoryBackend(config);
    const podBaseUrl = String(config.podBaseUrl || '').trim();
    const resourcePath = String(config.resourcePath || '/sovereign/demo/state.json').trim();
    const remoteFetch = typeof config.fetch === 'function' ? config.fetch : window.fetch.bind(window);
    const fetchInit = config.fetchInit && typeof config.fetchInit === 'object' ? config.fetchInit : {};

    if (!podBaseUrl) {
      throw new Error('Solid pod backend requires `podBaseUrl`.');
    }

    let remoteUrl = '';
    try {
      remoteUrl = new URL(resourcePath, podBaseUrl).toString();
    } catch {
      throw new Error('Invalid solid pod backend URL configuration.');
    }

    const buildHeaders = (extra) => ({ ...(extra && typeof extra === 'object' ? extra : {}) });

    let persistChain = Promise.resolve();
    let lastPersistPromise = Promise.resolve();
    let initialized = false;
    let pendingState = null;
    let stateParser = (value) => value;

    const queueRemoteWrite = (state) => {
      const body = JSON.stringify(state);
      const writePromise = persistChain
        .catch(() => null)
        .then(async () => {
          const response = await remoteFetch(remoteUrl, {
            method: 'PUT',
            headers: buildHeaders({
              'content-type': 'application/json'
            }),
            body,
            ...fetchInit
          });
          if (!response.ok) {
            throw new Error(`Solid pod write failed (${response.status}).`);
          }
        });
      lastPersistPromise = writePromise;
      persistChain = writePromise
        .catch((error) => {
          console.error('Sovereign solid backend write failed:', error);
        });
    };

    const initialize = async ({ parseState, onHydrated, onError } = {}) => {
      stateParser = typeof parseState === 'function' ? parseState : stateParser;
      try {
        const response = await remoteFetch(remoteUrl, {
          method: 'GET',
          headers: buildHeaders({
            accept: 'application/json'
          }),
          ...fetchInit
        });

        if (response.status === 404) {
          initialized = true;
          const initialState = pendingState || memoryBackend.readState();
          if (initialState) queueRemoteWrite(initialState);
          pendingState = null;
          return;
        }
        if (!response.ok) {
          throw new Error(`Solid pod read failed (${response.status}).`);
        }

        const raw = await response.text();
        const parsedRaw = parseJson(raw);
        const parsedState = stateParser(parsedRaw);
        if (!parsedState) return;

        memoryBackend.writeState(parsedState);
        pendingState = null;
        initialized = true;

        if (typeof onHydrated === 'function') {
          onHydrated(parsedState);
        }
      } catch (error) {
        if (typeof onError === 'function') {
          onError(error);
          return;
        }
        console.error('Sovereign solid backend init failed:', error);
      }
    };

    const subscribe = (listener) => memoryBackend.subscribe(async (payload) => {
      try {
        const response = await remoteFetch(remoteUrl, {
          method: 'GET',
          headers: buildHeaders({ accept: 'application/json' }),
          ...fetchInit
        });
        if (!response.ok) {
          throw new Error(`Solid pod refresh failed (${response.status}).`);
        }
        const parsedState = stateParser(parseJson(await response.text()));
        if (!parsedState) throw new Error('Solid pod refresh returned invalid demo state.');
        memoryBackend.writeState(parsedState);
        listener(payload);
      } catch (error) {
        console.error('Sovereign solid backend refresh failed:', error);
      }
    });

    return {
      mode: 'solid-pod',
      remoteUrl,
      readState: () => memoryBackend.readState(),
      writeState: (state) => {
        memoryBackend.writeState(state);
        if (!initialized) {
          pendingState = state;
          return;
        }
        queueRemoteWrite(state);
      },
      notify: (payload) => {
        lastPersistPromise
          .then(() => memoryBackend.notify(payload))
          .catch(() => null);
      },
      subscribe,
      initialize
    };
  };

  window.SovereignPodStorage = Object.freeze({
    createMemoryBackend,
    createSolidPodBackend
  });
})();
