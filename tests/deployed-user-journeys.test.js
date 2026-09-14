import assert from 'node:assert/strict';
import test from 'node:test';
import { loadBrowserGlobal, loadOrganizations } from './helpers.js';

const appUrl = process.env.DEPLOYED_APP_URL || 'https://demo.sovereign.ngo/';
const apiDomain = process.env.DEPLOYED_API_DOMAIN || 'api.demo.sovereign.ngo';
const hostnameOverrides = {
  nolichucky_family_clinic: 'nolichucky.api.demo.sovereign.ngo',
  riverbend_dental_clinic: 'riverbend.api.demo.sovereign.ngo',
  united_states_passport_office: 'passport.api.demo.sovereign.ngo',
  state_driver_licensing_agency: 'driver-license.api.demo.sovereign.ngo'
};

const fetchChecked = async (url, init = {}) => {
  let response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    throw new Error(`Unable to reach deployed endpoint ${url}: ${error.message}`);
  }
  assert.ok(response.ok, `${init.method || 'GET'} ${url} returned ${response.status}`);
  return response;
};

test('deployed services can operate every configured user journey', { timeout: 180_000 }, async () => {
  const organizations = await loadOrganizations();
  const { tutorialChains } = await loadBrowserGlobal(
    'webapp/tutorial/scenarios.global.js',
    'SovereignIndividualTutorialData'
  );

  const deployedPage = await fetchChecked(new URL('tutorial/individual/', appUrl));
  assert.match(await deployedPage.text(), /Individual service ecosystem|Individual Service Ecosystem/i);

  const deployedScenarios = await fetchChecked(new URL('tutorial/scenarios.global.js', appUrl));
  const deployedScenarioSource = await deployedScenarios.text();
  for (const journey of tutorialChains) {
    assert.ok(deployedScenarioSource.includes(`id: '${journey.id}'`), `deployment is missing journey ${journey.id}`);
  }

  const healthyProviders = new Set();
  for (const journey of tutorialChains) {
    for (const [stepIndex, step] of journey.steps.entries()) {
      const providerId = step.expectedEvent.providerId;
      const organization = organizations[providerId];
      assert.ok(organization, `${journey.id} references unknown provider ${providerId}`);
      const hostname = hostnameOverrides[providerId] || `${organization.directory}.${apiDomain}`;
      const providerUrl = new URL(`https://${hostname}/`);

      if (!healthyProviders.has(providerId)) {
        const health = await fetchChecked(new URL('health', providerUrl));
        const healthBody = await health.json();
        assert.equal(healthBody.ok, true);
        assert.equal(healthBody.organizationId, providerId);
        healthyProviders.add(providerId);
      }

      const transaction = await fetchChecked(new URL('presentations/submit', providerUrl), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'SovereignDemoJourneyStep',
          synthetic: true,
          journeyId: journey.id,
          step: stepIndex + 1,
          action: step.action,
          expectedEvent: step.expectedEvent
        })
      });
      const result = await transaction.json();
      assert.equal(result.accepted, true, `${journey.id} step ${stepIndex + 1} was rejected`);
      assert.equal(result.organizationId, providerId);
    }
  }
});
