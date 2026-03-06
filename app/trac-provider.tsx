"use client";

import { TracAnalytics } from "traaaction/react";

export function TracProvider() {
  return (
    <TracAnalytics
      apiHost="/_trac"
      outboundDomains={["app.akyra.io", "shop.akyra.io"]}
    />
  );
}
