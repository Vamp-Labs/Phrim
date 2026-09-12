import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ALL_PHRIM_ERROR_CODES } from "../src/viewmodels/errors";
import {
  MOCK_COLLATERAL_BY_SCENARIO,
  MOCK_DRAW_REQUEST_BY_STAGE,
  MOCK_DRAW_RESULT_FUNDED,
  MOCK_DRAW_RESULT_REJECTED_BY_CODE,
  MOCK_FACILITY_SETUP_BY_STATE,
  MOCK_HISTORY_ACTIVE_WITH_RECEIPTS,
  MOCK_HISTORY_CLOSED,
  MOCK_HISTORY_EMPTY,
  MOCK_HISTORY_FROZEN,
} from "../src/viewmodels/mocks";
import type { ActionState, ProofStage, ScenarioId } from "../src/viewmodels/types";
import { CollateralView } from "../src/ui/views/CollateralView";
import { DrawRequestView } from "../src/ui/views/DrawRequestView";
import { DrawResultView } from "../src/ui/views/DrawResultView";
import { FacilitySetupView } from "../src/ui/views/FacilitySetupView";
import { HistoryView } from "../src/ui/views/HistoryView";

const ACTION_STATES: ActionState[] = ["idle", "busy", "done", "error"];
const SCENARIOS: ScenarioId[] = ["eligible", "undercollateralized", "stale", "tampered", "replay"];
const PROOF_STAGES: ProofStage[] = [
  "idle",
  "preparing",
  "proving",
  "awaiting-wallet",
  "submitting",
  "confirmed",
  "failed",
];

describe("presentational views render for every mock state", () => {
  it.each(ACTION_STATES)("FacilitySetupView renders submitState=%s", (state) => {
    const markup = renderToStaticMarkup(<FacilitySetupView vm={MOCK_FACILITY_SETUP_BY_STATE[state]} />);
    expect(markup.length).toBeGreaterThan(0);
  });

  it.each(SCENARIOS)("CollateralView renders scenario=%s", (scenario) => {
    const markup = renderToStaticMarkup(<CollateralView vm={MOCK_COLLATERAL_BY_SCENARIO[scenario]} />);
    expect(markup.length).toBeGreaterThan(0);
  });

  it.each(PROOF_STAGES)("DrawRequestView renders stage=%s", (stage) => {
    const markup = renderToStaticMarkup(<DrawRequestView vm={MOCK_DRAW_REQUEST_BY_STAGE[stage]} />);
    expect(markup.length).toBeGreaterThan(0);
  });

  it("DrawResultView renders the funded outcome", () => {
    const markup = renderToStaticMarkup(<DrawResultView vm={MOCK_DRAW_RESULT_FUNDED} />);
    expect(markup).toContain("Draw funded");
  });

  it.each(ALL_PHRIM_ERROR_CODES)("DrawResultView renders rejected outcome for %s", (code) => {
    const markup = renderToStaticMarkup(<DrawResultView vm={MOCK_DRAW_RESULT_REJECTED_BY_CODE[code]} />);
    expect(markup).toContain("Draw rejected");
    expect(markup).toContain("Zero funds moved");
  });

  it("HistoryView renders an empty draw history", () => {
    const markup = renderToStaticMarkup(<HistoryView vm={MOCK_HISTORY_EMPTY} />);
    expect(markup).toContain("No draws recorded");
  });

  it("HistoryView renders active, frozen and closed status with receipts", () => {
    for (const vm of [MOCK_HISTORY_ACTIVE_WITH_RECEIPTS, MOCK_HISTORY_FROZEN, MOCK_HISTORY_CLOSED]) {
      const markup = renderToStaticMarkup(<HistoryView vm={vm} />);
      expect(markup.length).toBeGreaterThan(0);
    }
  });
});
