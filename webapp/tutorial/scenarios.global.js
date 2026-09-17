(function () {
const tutorialChains = [
      {
        id: 'onboard-all-documents',
        title: "I Lost My Wallet—Help Me Re-establish Photo ID",
        description: 'Re-establish trusted state and federal photo identification after a wallet is lost.',
        steps: [
          {
            groupId: 'naics-92',
            subsectorId: 'naics-926',
            serviceId: 'state-driver-licensing-agency',
            endpointKey: 'verifier_drivers_license',
            label: "Issue driver's license/state ID credential",
            instruction: "Click LOGIN, then click Verify and Issue VC.",
            action: { kind: 'verify', requireConsentToStore: true },
            expectedEvent: { type: 'identity-vc-issued', providerId: 'state_driver_licensing_agency', credentialType: 'DriversLicenseCredential' }
          },
          {
            groupId: 'naics-92',
            subsectorId: 'naics-928',
            serviceId: 'united-states-passport-office',
            endpointKey: 'verifier_passport',
            label: 'Issue passport/passport card credential',
            instruction: "Click LOGIN, then click Verify and Issue VC.",
            action: { kind: 'verify', requireConsentToStore: true },
            expectedEvent: { type: 'identity-vc-issued', providerId: 'united_states_passport_office', credentialType: 'PassportCredential' }
          }
        ]
      },
      {
        id: 'clinic-to-pharmacy',
        title: 'Get My Medicine (Primary Care Provider + Pharmacy)',
        description: 'A common clinic-to-pharmacy handoff for medication access.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-621',
            serviceId: 'hospital-clinic',
            endpointKey: 'nolichucky_family_clinic',
            label: 'Clinic issues medication prescription',
            instruction: "Set staff action to 'Issue medication prescription', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_pharmacy_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'nolichucky_family_clinic', targetCapability: 'pharmacy-services' }
          },
          {
            groupId: 'naics-44-45',
            subsectorId: 'naics-446',
            serviceId: 'mainstreet-community-pharmacy',
            endpointKey: 'mainstreet_community_pharmacy',
            label: 'Pharmacy fulfills referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'mainstreet_community_pharmacy', targetCapability: 'pharmacy-services' }
          }
        ]
      },
      {
        id: 'ambulance-hospital-home-health',
        title: 'Help Me Recover Safely After Leaving the Hospital',
        description: 'Connect emergency transport, hospital treatment, discharge, and recovery at home.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-621',
            serviceId: 'tri-county-ambulance',
            endpointKey: 'tri_county_ambulance',
            label: 'Ambulance issues emergency handoff',
            instruction: "Set staff action to 'Issue emergency handoff referral to hospital', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_emergency_handoff_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'tri_county_ambulance', targetCapability: 'emergency-care' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-622',
            serviceId: 'emergency-department',
            endpointKey: 'summitview_emergency_department',
            label: 'Hospital fulfills emergency handoff',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'summitview_emergency_department', targetCapability: 'emergency-care' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-622',
            serviceId: 'emergency-department',
            endpointKey: 'summitview_emergency_department',
            label: 'Hospital issues home-health follow-up',
            instruction: "Set staff action to 'Issue home health follow-up referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_home_health_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'summitview_emergency_department', targetCapability: 'home-health' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-621',
            serviceId: 'caringhands-home-health',
            endpointKey: 'caringhands_home_health',
            label: 'Home health fulfills follow-up',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'caringhands_home_health', targetCapability: 'home-health' }
          }
        ]
      },
      {
        id: 'childcare-training-employment',
        title: 'I Got a Job—Help Me Find Child Care So I Can Keep It',
        description: 'Connect child care, training, and job placement so an opportunity becomes sustainable.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-624',
            serviceId: 'sunrise-child-day-center',
            endpointKey: 'sunrise_child_day_center',
            label: 'Child care issues training referral',
            instruction: "Set staff action to 'Issue workforce training referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_workforce_training_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'sunrise_child_day_center', targetCapability: 'workforce-training' }
          },
          {
            groupId: 'naics-61',
            subsectorId: 'naics-611',
            serviceId: 'highland-workforce-training-institute',
            endpointKey: 'highland_workforce_training_institute',
            label: 'Training provider fulfills referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'highland_workforce_training_institute', targetCapability: 'workforce-training' }
          },
          {
            groupId: 'naics-61',
            subsectorId: 'naics-611',
            serviceId: 'highland-workforce-training-institute',
            endpointKey: 'highland_workforce_training_institute',
            label: 'Training provider issues placement referral',
            instruction: "Set staff action to 'Issue employment placement referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_employment_placement_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'highland_workforce_training_institute', targetCapability: 'employment-support' }
          },
          {
            groupId: 'naics-56',
            subsectorId: 'naics-561',
            serviceId: 'ascent-employment-placement-agency',
            endpointKey: 'ascent_employment_placement_agency',
            label: 'Placement agency fulfills referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'ascent_employment_placement_agency', targetCapability: 'employment-support' }
          }
        ]
      },
      {
        id: 'behavioral-stepup-stepdown',
        title: 'Help Me Recover Safely After a Mental-Health Crisis',
        description: 'Escalate to residential support when needed, then return to continuing outpatient care.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-621',
            serviceId: 'ridgeview-behavioral-health-center',
            endpointKey: 'ridgeview_behavioral_health_center',
            label: 'Outpatient issues residential escalation',
            instruction: "Set staff action to 'Issue residential recovery referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_residential_recovery_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'ridgeview_behavioral_health_center', targetCapability: 'residential-treatment' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-623',
            serviceId: 'horizon-residential-recovery-center',
            endpointKey: 'horizon_residential_recovery_center',
            label: 'Residential fulfills escalation',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'horizon_residential_recovery_center', targetCapability: 'residential-treatment' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-623',
            serviceId: 'horizon-residential-recovery-center',
            endpointKey: 'horizon_residential_recovery_center',
            label: 'Residential issues outpatient follow-up',
            instruction: "Set staff action to 'Issue outpatient behavioral follow-up referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_outpatient_behavioral_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'horizon_residential_recovery_center', targetCapability: 'behavioral-health' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-621',
            serviceId: 'ridgeview-behavioral-health-center',
            endpointKey: 'ridgeview_behavioral_health_center',
            label: 'Outpatient fulfills follow-up',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'ridgeview_behavioral_health_center', targetCapability: 'behavioral-health' }
          }
        ]
      },
      {
        id: 'care-insurance-claims',
        title: 'Check My Coverage and Claim (Primary Care Provider + Health Insurance Carrier + Claims Administrator)',
        description: 'Coordinate care, coverage checks, and claim status updates.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-621',
            serviceId: 'hospital-clinic',
            endpointKey: 'nolichucky_family_clinic',
            label: 'Care provider issues eligibility referral',
            instruction: "Set staff action to 'Issue insurance eligibility referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_insurance_eligibility_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'nolichucky_family_clinic', targetCapability: 'insurance-enrollment' }
          },
          {
            groupId: 'naics-52',
            subsectorId: 'naics-524',
            serviceId: 'summit-health-insurance-carrier',
            endpointKey: 'summit_health_insurance_carrier',
            label: 'Insurance fulfills eligibility referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'summit_health_insurance_carrier', targetCapability: 'insurance-enrollment' }
          },
          {
            groupId: 'naics-52',
            subsectorId: 'naics-524',
            serviceId: 'summit-health-insurance-carrier',
            endpointKey: 'summit_health_insurance_carrier',
            label: 'Insurance issues claims administration referral',
            instruction: "Set staff action to 'Issue claims administration referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_claims_admin_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'summit_health_insurance_carrier', targetCapability: 'claims-processing' }
          },
          {
            groupId: 'naics-52',
            subsectorId: 'naics-524',
            serviceId: 'atlas-claims-administration',
            endpointKey: 'atlas_claims_administration',
            label: 'Claims admin fulfills referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'atlas_claims_administration', targetCapability: 'claims-processing' }
          },
          {
            groupId: 'naics-52',
            subsectorId: 'naics-524',
            serviceId: 'atlas-claims-administration',
            endpointKey: 'atlas_claims_administration',
            label: 'Claims admin returns status referral',
            instruction: "Set staff action to 'Issue claims status referral back to care provider', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_claims_status_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'atlas_claims_administration', targetCapability: 'medical-records' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-621',
            serviceId: 'hospital-clinic',
            endpointKey: 'nolichucky_family_clinic',
            label: 'Care provider fulfills status return',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'nolichucky_family_clinic', targetCapability: 'medical-records' }
          }
        ]
      },
      {
        id: 'legal-rights-disputes',
        title: 'My Insurance Denied the Care I Need',
        description: 'Carry the evidence for an insurance dispute through claims review, legal support, and consumer protection.',
        steps: [
          {
            groupId: 'naics-54',
            subsectorId: 'naics-541',
            serviceId: 'community-legal-aid-collective',
            endpointKey: 'community_legal_aid_collective',
            label: 'Legal aid issues insurance-dispute referral',
            instruction: "Set staff action to 'Issue insurance dispute referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_insurance_dispute_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'community_legal_aid_collective', targetCapability: 'claims-processing' }
          },
          {
            groupId: 'naics-52',
            subsectorId: 'naics-524',
            serviceId: 'atlas-claims-administration',
            endpointKey: 'atlas_claims_administration',
            label: 'Claims admin fulfills dispute referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'atlas_claims_administration', targetCapability: 'claims-processing' }
          },
          {
            groupId: 'naics-54',
            subsectorId: 'naics-541',
            serviceId: 'community-legal-aid-collective',
            endpointKey: 'community_legal_aid_collective',
            label: 'Legal aid issues consumer-protection referral',
            instruction: "Set staff action to 'Issue consumer protection referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_consumer_protection_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'community_legal_aid_collective', targetCapability: 'consumer-protection' }
          },
          {
            groupId: 'naics-81',
            subsectorId: 'naics-813',
            serviceId: 'consumer-regulation-support',
            endpointKey: 'consumer_regulation_support',
            label: 'Consumer-protection agency fulfills referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'consumer_regulation_support', targetCapability: 'consumer-protection' }
          }
        ]
      },
      {
        id: 'coordinated-entry-to-housing-match',
        title: 'Move from Coordinated Entry to Housing Match (Housing Navigation Provider + Residential Leasing Provider + Property Management Provider)',
        description: 'Model the coordinated-entry queue moving into housing placement and stabilization.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-624',
            serviceId: 'fairmannor-house',
            endpointKey: 'fairmannor_house',
            label: 'Housing navigation issues placement referral',
            instruction: "Set staff action to 'Issue housing placement referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_housing_placement_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'fairmannor_house', targetCapability: 'housing-access' }
          },
          {
            groupId: 'naics-53',
            subsectorId: 'naics-531',
            serviceId: 'homestead-residential-leasing',
            endpointKey: 'homestead_residential_leasing',
            label: 'Leasing provider fulfills placement referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'homestead_residential_leasing', targetCapability: 'housing-access' }
          },
          {
            groupId: 'naics-53',
            subsectorId: 'naics-531',
            serviceId: 'homestead-residential-leasing',
            endpointKey: 'homestead_residential_leasing',
            label: 'Leasing provider issues property handoff',
            instruction: "Set staff action to 'Issue property management referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_property_management_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'homestead_residential_leasing', targetCapability: 'housing-stability' }
          },
          {
            groupId: 'naics-53',
            subsectorId: 'naics-531',
            serviceId: 'cornerstone-property-management',
            endpointKey: 'cornerstone_property_management',
            label: 'Property management fulfills stabilization handoff',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'cornerstone_property_management', targetCapability: 'housing-stability' }
          }
        ]
      },
      {
        id: 'housing-stabilization',
        title: 'Help Me Move into My First Stable Home',
        description: 'Move from shelter to a lease, property support, utilities, and reusable proof of residency.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-624',
            serviceId: 'safeharbor-shelter',
            endpointKey: 'safeharbor_shelter',
            label: 'Shelter issues housing placement',
            instruction: "Set staff action to 'Issue housing placement referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_housing_placement_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'safeharbor_shelter', targetCapability: 'housing-access' }
          },
          {
            groupId: 'naics-53',
            subsectorId: 'naics-531',
            serviceId: 'homestead-residential-leasing',
            endpointKey: 'homestead_residential_leasing',
            label: 'Leasing fulfills housing placement',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'homestead_residential_leasing', targetCapability: 'housing-access' }
          },
          {
            groupId: 'naics-53',
            subsectorId: 'naics-531',
            serviceId: 'homestead-residential-leasing',
            endpointKey: 'homestead_residential_leasing',
            label: 'Leasing issues property management handoff',
            instruction: "Set staff action to 'Issue property management referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_property_management_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'homestead_residential_leasing', targetCapability: 'housing-stability' }
          },
          {
            groupId: 'naics-53',
            subsectorId: 'naics-531',
            serviceId: 'cornerstone-property-management',
            endpointKey: 'cornerstone_property_management',
            label: 'Property management fulfills housing-stability handoff',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'cornerstone_property_management', targetCapability: 'housing-stability' }
          },
          {
            groupId: 'naics-53',
            subsectorId: 'naics-531',
            serviceId: 'cornerstone-property-management',
            endpointKey: 'cornerstone_property_management',
            label: 'Property management issues utility setup',
            instruction: "Set staff action to 'Issue utility setup referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_utility_setup_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'cornerstone_property_management', targetCapability: 'utility-service' }
          },
          {
            groupId: 'naics-22',
            subsectorId: 'naics-221',
            serviceId: 'appalachian-electric-distribution',
            endpointKey: 'appalachian_electric_distribution',
            label: 'Utility fulfills setup',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'appalachian_electric_distribution', targetCapability: 'utility-service' }
          },
          {
            groupId: 'naics-22',
            subsectorId: 'naics-221',
            serviceId: 'appalachian-electric-distribution',
            endpointKey: 'appalachian_electric_distribution',
            label: 'Utility issues residency evidence credential',
            instruction: "Set staff action to 'Issue utility residency evidence credential', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_residency_evidence_credential' },
            expectedEvent: { type: 'credential-issued', providerId: 'appalachian_electric_distribution', actionId: 'issue_residency_evidence_credential' }
          }
        ]
      },      {
        id: 'outreach-to-shelter',
        title: 'I Need Somewhere Safe Tonight',
        description: 'Move from street outreach into immediate shelter without making documentation a barrier.',
        steps: [
          {
            groupId: 'naics-62',
            subsectorId: 'naics-624',
            serviceId: 'salutation-army',
            endpointKey: 'salutation_army',
            label: 'Outreach team issues shelter referral',
            instruction: "Set staff action to 'Issue shelter access referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'issue_shelter_access_referral' },
            expectedEvent: { type: 'referral-issued', providerId: 'salutation_army', targetCapability: 'shelter-access' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-624',
            serviceId: 'safeharbor-shelter',
            endpointKey: 'safeharbor_shelter',
            label: 'Shelter fulfills outreach referral',
            instruction: "Set staff action to 'Fulfill selected referral', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'fulfill_selected_referral' },
            expectedEvent: { type: 'referral-fulfilled', providerId: 'safeharbor_shelter', targetCapability: 'shelter-access' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-624',
            serviceId: 'community-food-pantry',
            endpointKey: 'community_food_pantry',
            label: 'Food pantry prepares immediate food support',
            instruction: "Set staff action to 'Prepare food distribution', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'prepare_food_distribution' },
            expectedEvent: { type: 'staff-action', providerId: 'community_food_pantry', actionId: 'prepare_food_distribution' }
          },
          {
            groupId: 'naics-62',
            subsectorId: 'naics-624',
            serviceId: 'fairmannor-house',
            endpointKey: 'fairmannor_house',
            label: 'Housing navigator starts a stability plan',
            instruction: "Set staff action to 'Create housing navigation plan', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'create_housing_navigation_plan' },
            expectedEvent: { type: 'staff-action', providerId: 'fairmannor_house', actionId: 'create_housing_navigation_plan' }
          }
        ]
      },

      {
        id: 'help-without-documents',
        title: 'I Need Help, but I Don’t Have All My Documents',
        description: 'Start safety-critical support immediately, then build a usable document packet without turning missing credentials into a barrier.',
        steps: [
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'safeharbor-shelter', endpointKey: 'safeharbor_shelter',
            label: 'Request emergency shelter without documents',
            instruction: "Set self-service action to 'Request emergency shelter support', then click Run Self-Service Action.",
            action: { kind: 'self', actionId: 'request_shelter_bed' },
            expectedEvent: { type: 'self-service-action', providerId: 'safeharbor_shelter', actionId: 'request_shelter_bed' }
          },
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'community-food-pantry', endpointKey: 'community_food_pantry',
            label: 'Request food support without documents',
            instruction: "Set self-service action to 'Request food pantry support', then click Run Self-Service Action.",
            action: { kind: 'self', actionId: 'request_food_assistance' },
            expectedEvent: { type: 'self-service-action', providerId: 'community_food_pantry', actionId: 'request_food_assistance' }
          },
          {
            groupId: 'naics-56', subsectorId: 'naics-561', serviceId: 'cedar-document-preparation-center', endpointKey: 'cedar_document_preparation_center',
            label: 'Prepare a replacement document packet',
            instruction: "Set staff action to 'Prepare document packet', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'prepare_document_packet' },
            expectedEvent: { type: 'staff-action', providerId: 'cedar_document_preparation_center', actionId: 'prepare_document_packet' }
          }
        ]
      },
      {
        id: 'prevent-eviction',
        title: 'I’m Facing Eviction',
        description: 'Coordinate tenant advocacy, emergency assistance, mediation, and a concrete housing-stability plan.',
        steps: [
          {
            groupId: 'naics-81', subsectorId: 'naics-813', serviceId: 'tenant-rights-advocacy-network', endpointKey: 'tenant_rights_advocacy_network',
            label: 'Create a tenant advocacy plan', instruction: "Set staff action to 'Create tenant advocacy plan', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'create_tenant_advocacy_plan' }, expectedEvent: { type: 'staff-action', providerId: 'tenant_rights_advocacy_network', actionId: 'create_tenant_advocacy_plan' }
          },
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'beacon-emergency-relief-services', endpointKey: 'beacon_emergency_relief_services',
            label: 'Authorize emergency assistance', instruction: "Set staff action to 'Authorize emergency aid', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'authorize_emergency_aid' }, expectedEvent: { type: 'staff-action', providerId: 'beacon_emergency_relief_services', actionId: 'authorize_emergency_aid' }
          },
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'family-mediation-center', endpointKey: 'family_mediation_center',
            label: 'Schedule mediation', instruction: "Set staff action to 'Schedule mediation', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'schedule_mediation' }, expectedEvent: { type: 'staff-action', providerId: 'family_mediation_center', actionId: 'schedule_mediation' }
          },
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'fairmannor-house', endpointKey: 'fairmannor_house',
            label: 'Create a housing navigation plan', instruction: "Set staff action to 'Create housing navigation plan', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'create_housing_navigation_plan' }, expectedEvent: { type: 'staff-action', providerId: 'fairmannor_house', actionId: 'create_housing_navigation_plan' }
          }
        ]
      },
      {
        id: 'recover-after-disaster',
        title: 'I’m Starting Over After a Disaster',
        description: 'Connect immediate relief, replacement documents, financial planning, temporary shelter, and housing recovery.',
        steps: [
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'beacon-emergency-relief-services', endpointKey: 'beacon_emergency_relief_services',
            label: 'Assess immediate disaster needs', instruction: "Set staff action to 'Assess immediate needs', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'assess_immediate_needs' }, expectedEvent: { type: 'staff-action', providerId: 'beacon_emergency_relief_services', actionId: 'assess_immediate_needs' }
          },
          {
            groupId: 'naics-56', subsectorId: 'naics-561', serviceId: 'cedar-document-preparation-center', endpointKey: 'cedar_document_preparation_center',
            label: 'Prepare replacement documents', instruction: "Set staff action to 'Prepare document packet', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'prepare_document_packet' }, expectedEvent: { type: 'staff-action', providerId: 'cedar_document_preparation_center', actionId: 'prepare_document_packet' }
          },
          {
            groupId: 'naics-52', subsectorId: 'naics-523', serviceId: 'financial-wellness-center', endpointKey: 'financial_wellness_center',
            label: 'Create a recovery financial plan', instruction: "Set staff action to 'Create financial plan', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'create_financial_plan' }, expectedEvent: { type: 'staff-action', providerId: 'financial_wellness_center', actionId: 'create_financial_plan' }
          },
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'safeharbor-shelter', endpointKey: 'safeharbor_shelter',
            label: 'Complete temporary shelter intake', instruction: "Set staff action to 'Complete shelter intake', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'complete_shelter_intake' }, expectedEvent: { type: 'staff-action', providerId: 'safeharbor_shelter', actionId: 'complete_shelter_intake' }
          },
          {
            groupId: 'naics-62', subsectorId: 'naics-624', serviceId: 'fairmannor-house', endpointKey: 'fairmannor_house',
            label: 'Start long-term housing recovery', instruction: "Set staff action to 'Create housing navigation plan', then click Run Staff Action.",
            action: { kind: 'staff', actionId: 'create_housing_navigation_plan' }, expectedEvent: { type: 'staff-action', providerId: 'fairmannor_house', actionId: 'create_housing_navigation_plan' }
          }
        ]
      },

    ];
const tutorialCompletionNarrativeById = {
      'clinic-to-pharmacy': 'A clinic handed off medication needs to a pharmacy, and the pharmacy fulfilled that handoff.',
      'ambulance-hospital-home-health': 'Emergency transport, hospital care, and home-health follow-up were coordinated as one connected path.',
      'housing-stabilization': 'Housing access moved from shelter to leasing to utilities, ending with proof that supports long-term stability.',
      'behavioral-stepup-stepdown': 'Outpatient and residential behavioral support were coordinated as step-up and step-down care.',
      'care-insurance-claims': 'Care, insurance review, and claims updates were exchanged without breaking continuity for the person.',
      'childcare-training-employment': 'Family support, training, and job placement were linked into one progression.',
      'legal-rights-disputes': 'Legal and consumer-protection pathways were coordinated through auditable referrals and completion steps.',
      'outreach-to-shelter': 'Street outreach moved a person into emergency shelter through a direct, trackable handoff.',
      'coordinated-entry-to-housing-match': 'Coordinated-entry style housing navigation moved into placement and stabilization steps.',
      'onboard-all-documents': 'A full set of common identity and proof documents was rebuilt as trusted credentials.',
      'help-without-documents': 'Immediate help began without documents, followed by support to prepare replacements.',
      'prevent-eviction': 'Tenant advocacy, emergency aid, mediation, and housing navigation were coordinated before displacement.',
      'recover-after-disaster': 'Immediate disaster relief progressed into document, financial, shelter, and long-term housing recovery.'
    };

window.SovereignIndividualTutorialData = { tutorialChains, tutorialCompletionNarrativeById };
})();
