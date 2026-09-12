import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jubjubPointX, jubjubPointY } from '@midnight-ntwrk/compact-runtime';
import { phrimPureCircuits } from '@phrim/contract';
import { bytesToHex } from '../src/bytes.js';
import { buildCanonicalWords, computeCredentialDigest } from '../src/canonical.js';
import { buildNullifierPreimageWords, computeAssetNullifier } from '../src/nullifier.js';
import { scalarFromSeed, makeAttestorKeypair } from '../src/schnorr.js';
import { bindPhrimPureCircuits } from '../src/wireContract.js';
import { createCredentialSigner } from '../src/attestorSigner.js';
import { bindFixtureSigner } from '../src/fixtures/sign.js';
import { credentialToJson, type AttestedAssetCredential } from '../src/types.js';
import { DEMO_ATTESTOR_SECRET_SEED, FACILITY_DEMO_001_ID_HEX } from '../src/fixtures/demoValues.js';
import { UNSIGNED_SCENARIOS } from '../src/fixtures/scenarios.js';
import { materializeScenarioBatch } from '../src/fixtures/sign.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'test', 'vectors');

bindPhrimPureCircuits(phrimPureCircuits);

const secretKey = scalarFromSeed(DEMO_ATTESTOR_SECRET_SEED);
const keypair = makeAttestorKeypair(secretKey);
bindFixtureSigner(createCredentialSigner(keypair));

function credentialVector(credential: AttestedAssetCredential, tampered: boolean) {
  const words = buildCanonicalWords(credential);
  const digestHex = bytesToHex(computeCredentialDigest(credential));
  const nullifierWords = buildNullifierPreimageWords(credential.facilityId, credential.assetNonce);
  return {
    input: credentialToJson(credential),
    canonicalWordsHex: words.map((word) => bytesToHex(word)),
    credentialDigestHex: digestHex,
    nullifierPreimageWordsHex: nullifierWords.map((word) => bytesToHex(word)),
    nullifierHex: bytesToHex(computeAssetNullifier(credential.facilityId, credential.assetNonce)),
    signatureExpectedValid: !tampered,
  };
}

function main(): void {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, 'facility.json'),
    `${JSON.stringify({ label: 'FACILITY_DEMO_001', idHex: FACILITY_DEMO_001_ID_HEX }, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, 'attestor.json'),
    `${JSON.stringify(
      {
        secretKeySeedLabel: 'phrim:demo-attestor-secret:v1',
        publicKeyX: jubjubPointX(keypair.publicKey).toString(10),
        publicKeyY: jubjubPointY(keypair.publicKey).toString(10),
      },
      null,
      2,
    )}\n`,
  );
  for (const scenario of Object.values(UNSIGNED_SCENARIOS)) {
    const batch = materializeScenarioBatch(scenario);
    const occupied = batch
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.slotOccupied)
      .map(({ slot, index }) =>
        credentialVector(slot.credential as AttestedAssetCredential, scenario.tamperedField?.slotIndex === index),
      );
    writeFileSync(
      join(outDir, `${scenario.id}.json`),
      `${JSON.stringify(
        {
          scenarioId: scenario.id,
          description: scenario.description,
          expectedOutcome: scenario.expectedOutcome,
          expectedErrorCode: scenario.expectedErrorCode,
          facilityIdHex: FACILITY_DEMO_001_ID_HEX,
          attestorPublicKeyX: jubjubPointX(keypair.publicKey).toString(10),
          attestorPublicKeyY: jubjubPointY(keypair.publicKey).toString(10),
          credentials: occupied,
        },
        null,
        2,
      )}\n`,
    );
  }
}

main();
