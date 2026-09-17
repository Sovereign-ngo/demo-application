(function () {
  const providerCatalog = typeof window !== "undefined" ? window.SovereignProviderCatalog : null;
  if (!Array.isArray(providerCatalog)) {
    throw new Error("Provider catalog failed to load.");
  }
  const services = window.SovereignRuntimeConfig.services;
  const organizations = services.organizations || {};
  const selectedPod = new URL(window.location.href).searchParams.get('pod') || '';
  const withContext = (baseUrl, parameters) => {
    const url = new URL(baseUrl);
    Object.entries(parameters || {}).forEach(([key, value]) => url.searchParams.set(key, value));
    if (selectedPod) url.searchParams.set('pod', selectedPod);
    return url.toString();
  };

  const providerEntries = providerCatalog.reduce((acc, provider) => {
    if (!provider || !provider.id) return acc;
    const providerId = String(provider.id);
    const encodedProviderId = encodeURIComponent(providerId);
    const providerUrl = withContext(organizations[providerId], { provider: encodedProviderId });
    acc[providerId] = {
      label: provider.label,
      url: providerUrl,
      type: provider.type,
      taxonomies: provider && provider.taxonomies && typeof provider.taxonomies === "object"
        ? { ...provider.taxonomies }
        : null
    };
    return acc;
  }, {});

  const prefixEntries = {};
  const suffixEntries = {
  "verifier_passport": {
    "label": "United States Passport Office (Demo)",
    "url": withContext(organizations.united_states_passport_office, {}),
    "type": "identity-vc-issuer"
  },
  "verifier_drivers_license": {
    "label": "State Driver Licensing Agency (Demo)",
    "url": withContext(organizations.state_driver_licensing_agency, {}),
    "type": "identity-vc-issuer"
  },
  "blank": {
    "label": "Blank",
    "url": "about:blank",
    "type": "none"
  }
};

  const endpointDirectory = {
    ...prefixEntries,
    ...providerEntries,
    ...suffixEntries
  };

  if (typeof window !== "undefined") {
    window.SovereignEndpointDirectory = Object.freeze(endpointDirectory);
  }
})();
