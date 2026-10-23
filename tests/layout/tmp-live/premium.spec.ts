// TEMPORARY — see tmp-live-tests.ts. Never merged.
import { test } from "@playwright/test";
import { defineLiveTests } from "../tmp-live-tests.ts";

test.skip(!process.env.TMP_LIVE, "live verification only in the temporary workflow");
defineLiveTests();
