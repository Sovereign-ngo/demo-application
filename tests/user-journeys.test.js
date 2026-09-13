import assert from 'node:assert/strict';
import test from 'node:test';
import { loadBrowserGlobal, loadMemoryPodState, loadOrganizations } from './helpers.js';

test('tutorial journeys reference real providers and supported actions', async () => {
  const organizations = await loadOrganizations();
  const { tutorialChains: journeys } = await loadBrowserGlobal('webapp/tutorial/scenarios.global.js', 'SovereignIndividualTutorialData');
  assert.ok(Array.isArray(journeys));
  const requiredHighImpactJourneys = [
    'onboard-all-documents',
    'clinic-to-pharmacy',
    'ambulance-hospital-home-health',
    'childcare-training-employment',
    'behavioral-stepup-stepdown',
    'care-insurance-claims',
    'legal-rights-disputes',
    'housing-stabilization',
    'outreach-to-shelter',
    'help-without-documents',
    'prevent-eviction',
    'recover-after-disaster'
  ];
  assert.ok(journeys.length >= requiredHighImpactJourneys.length);
  assert.equal(new Set(journeys.map((journey) => journey.id)).size, journeys.length);
  const journeyIds = new Set(journeys.map((journey) => journey.id));
  requiredHighImpactJourneys.forEach((id) => assert.ok(journeyIds.has(id), `missing high-impact journey ${id}`));

  for (const journey of journeys) {
    assert.ok(journey.title && journey.description);
    assert.ok(journey.steps.length > 0, `${journey.id} has no steps`);
    for (const step of journey.steps) {
      const providerId = step.expectedEvent.providerId;
      const provider = organizations[providerId];
      assert.ok(provider, `${journey.id} references missing provider ${providerId}`);
      if (step.action.kind === 'staff') {
        const behavior = provider.behaviors.configMap[providerId];
        const actionIds = new Set([
          'fulfill_selected_referral',
          ...(behavior?.staffActions || []).map(({ id }) => id),
          ...(provider.behaviors.pathwayActionExtensions?.[providerId] || []).map(({ id }) => id),
          ...Object.keys(provider.behaviors.referralActionCatalog || {}),
          ...Object.keys(provider.behaviors.directCredentialActionCatalog || {})
        ]);
        assert.ok(actionIds.has(step.action.actionId), `${journey.id}: ${providerId} lacks ${step.action.actionId}`);
      }
      if (step.action.kind === 'self') {
        const behavior = provider.behaviors.configMap[providerId];
        const actionIds = new Set((behavior?.selfActions || []).map(({ id }) => id));
        assert.ok(actionIds.has(step.action.actionId), `${journey.id}: ${providerId} lacks ${step.action.actionId}`);
      }
    }
  }
});

test('every journey has a completion narrative', async () => {
  const data = await loadBrowserGlobal('webapp/tutorial/scenarios.global.js', 'SovereignIndividualTutorialData');
  for (const journey of data.tutorialChains) {
    assert.ok(data.tutorialCompletionNarrativeById[journey.id], `${journey.id} has no completion narrative`);
  }
});

test('every journey can execute from its first step through completion', async () => {
  const organizations = await loadOrganizations();
  const data = await loadBrowserGlobal('webapp/tutorial/scenarios.global.js', 'SovereignIndividualTutorialData');

  for (const journey of data.tutorialChains) {
    const store = await loadMemoryPodState();
    const subject = store.listIdentities({ excludeStaff: true })[0];
    const staff = store.listIdentities({ staffOnly: true })[0];
    assert.ok(subject && staff, `${journey.id} cannot establish local actors`);

    for (const [index, step] of journey.steps.entries()) {
      const expected = step.expectedEvent;
      const provider = organizations[expected.providerId];
      const catalogs = provider.behaviors;
      const actionId = step.action.actionId || '';
      let payload = { actionId };

      if (step.action.kind === 'verify') {
        store.issueCredential({
          subjectWebId: subject.webId,
          type: expected.credentialType,
          issuerProviderId: expected.providerId,
          claims: { synthetic: true, verifierProfile: expected.verifierProfile }
        });
        payload = { credentialType: expected.credentialType, verifierProfile: expected.verifierProfile };
      } else if (expected.type === 'referral-issued') {
        const definition = catalogs.referralActionCatalog[actionId];
        const referral = store.addReferral({
          subjectWebId: subject.webId,
          fromProviderId: expected.providerId,
          targetCapability: definition.targetCapability,
          summary: definition.summary,
          actorWebId: staff.webId
        });
        store.issueCredential({
          subjectWebId: subject.webId,
          type: definition.credentialType,
          issuerProviderId: expected.providerId,
          claims: { referralId: referral.id, targetCapability: definition.targetCapability }
        });
        payload = { actionId, referralId: referral.id, targetCapability: definition.targetCapability };
      } else if (expected.type === 'referral-fulfilled') {
        const referral = store.listReferrals({
          subjectWebId: subject.webId,
          providerId: expected.providerId
        }).find((entry) => entry.targetCapability === expected.targetCapability);
        assert.ok(referral, `${journey.id} step ${index + 1} has no operable referral`);
        const result = store.fulfillReferral({ referralId: referral.id, providerId: expected.providerId, actorWebId: staff.webId });
        assert.equal(result.error, '', `${journey.id} step ${index + 1} could not fulfill referral`);
        store.addRecord({
          subjectWebId: subject.webId,
          providerId: expected.providerId,
          category: 'referral_fulfillment',
          summary: step.label,
          actorWebId: staff.webId
        });
        payload = { actionId, referralId: referral.id, targetCapability: expected.targetCapability };
      } else {
        store.addRecord({
          subjectWebId: subject.webId,
          providerId: expected.providerId,
          category: step.action.kind === 'self' ? 'self_service' : 'staff_service',
          summary: step.label,
          actorWebId: step.action.kind === 'self' ? subject.webId : staff.webId,
          details: { actionId }
        });
      }

      const event = store.addEvent({
        type: expected.type,
        providerId: expected.providerId,
        subjectWebId: subject.webId,
        actorWebId: step.action.kind === 'self' ? subject.webId : staff.webId,
        message: step.label,
        payload
      });
      assert.equal(event.type, expected.type, `${journey.id} step ${index + 1} emitted wrong event`);
      assert.equal(event.providerId, expected.providerId);
      for (const field of ['actionId', 'targetCapability', 'credentialType', 'verifierProfile']) {
        if (expected[field]) assert.equal(event.payload[field], expected[field], `${journey.id} step ${index + 1} mismatched ${field}`);
      }
    }

    const state = store.getState();
    assert.equal(state.referrals.filter((entry) => entry.status === 'open').length, 0, `${journey.id} left referrals unfinished`);
    assert.equal(store.listEvents({ subjectWebId: subject.webId }).length, journey.steps.length);
  }
});

test('each referral fulfillment follows a matching referral issuance', async () => {
  const { tutorialChains: journeys } = await loadBrowserGlobal('webapp/tutorial/scenarios.global.js', 'SovereignIndividualTutorialData');
  for (const journey of journeys) {
    const outstanding = new Map();
    for (const step of journey.steps) {
      const event = step.expectedEvent;
      if (event.type === 'referral-issued') {
        outstanding.set(event.targetCapability, (outstanding.get(event.targetCapability) || 0) + 1);
      }
      if (event.type === 'referral-fulfilled') {
        const count = outstanding.get(event.targetCapability) || 0;
        assert.ok(count > 0, `${journey.id} fulfills ${event.targetCapability} before it is issued`);
        outstanding.set(event.targetCapability, count - 1);
      }
    }
  }
});
