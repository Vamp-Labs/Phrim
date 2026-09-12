import { createHash } from 'node:crypto';

function sha256Hex(label) {
  return createHash('sha256').update(label, 'utf8').digest('hex');
}

const FACILITY_LABEL = 'FACILITY_DEMO_001';

const ELIGIBLE_ASSET_LABELS = Array.from(
  { length: 8 },
  (_, index) => `phrim:demo-asset-nonce:v1:eligible:${index}`,
);

const UNDERCOLLATERALIZED_ASSET_LABELS = Array.from(
  { length: 6 },
  (_, index) => `phrim:demo-asset-nonce:v1:undercollateralized:${index}`,
);

const BOUNDARY_RULES = ['dayspastdue', 'riskscore', 'maturityepoch', 'outstandingminor'];

const entries = [];
entries.push(['FACILITY_DEMO_001_ID', FACILITY_LABEL]);
ELIGIBLE_ASSET_LABELS.forEach((label, index) => entries.push([`ELIGIBLE_ASSET_NONCE_${index}`, label]));
UNDERCOLLATERALIZED_ASSET_LABELS.forEach((label, index) =>
  entries.push([`UNDERCOLLATERALIZED_ASSET_NONCE_${index}`, label]),
);
for (const rule of BOUNDARY_RULES) {
  entries.push([`BOUNDARY_${rule.toUpperCase()}_PASS_NONCE`, `phrim:demo-asset-nonce:v1:boundary:${rule}:pass`]);
  entries.push([`BOUNDARY_${rule.toUpperCase()}_FAIL_NONCE`, `phrim:demo-asset-nonce:v1:boundary:${rule}:fail`]);
}
entries.push(['WRONG_PROVIDER_ASSET_NONCE', 'phrim:demo-asset-nonce:v1:wrong-provider']);
entries.push(['WRONG_FACILITY_ASSET_NONCE', 'phrim:demo-asset-nonce:v1:wrong-facility']);
entries.push(['OTHER_FACILITY_DEMO_999_ID', 'OTHER_FACILITY_DEMO_999']);
entries.push(['DEMO_ATTESTOR_SECRET_SEED', 'phrim:demo-attestor-secret:v1']);

for (const [name, label] of entries) {
  console.log(`${name}=${sha256Hex(label)}`);
}
