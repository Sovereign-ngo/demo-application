(function () {
  if (window.SovereignPodConfig && typeof window.SovereignPodConfig === 'object') {
    return;
  }

  const runtimeConfig = window.SovereignRuntimeConfig;
  if (!runtimeConfig || typeof runtimeConfig !== 'object' || !runtimeConfig.services) {
    throw new Error('Sovereign runtime configuration failed to load.');
  }

  const solidSession = window.SovereignSolidSession;
  const podSelection = solidSession && typeof solidSession.getSelection === 'function'
    ? solidSession.getSelection()
    : null;

  window.SovereignPodConfig = {
    backend: podSelection ? {
      mode: 'solid-pod',
      podBaseUrl: podSelection.podBaseUrl,
      resourcePath: 'sovereign-demo-state.json',
      fetch: solidSession.fetch
    } : {
      mode: 'memory'
    },
    environment: runtimeConfig.environment,
    services: runtimeConfig.services,
    podConnectionRequired: !podSelection
  };
})();
