import { useEffect, useState } from "react";
import { phoneStatus } from "../phone/api";
import { viewerState } from "../viewer/api";

export function useOrderAvailability() {
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let live = true;
    void Promise.all([phoneStatus(), viewerState()])
      .then(([phone, viewer]) => {
        if (live) setUnavailable(!phone.available && viewer.state !== "in");
      })
      .catch(() => {
        if (live) setUnavailable(true);
      });
    return () => {
      live = false;
    };
  }, []);
  return unavailable;
}
