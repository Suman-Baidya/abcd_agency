"use client";

import React, { createContext, useContext } from "react";

const MarketingLayoutContext = createContext<boolean>(false);

export function MarketingLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingLayoutContext.Provider value={true}>
      {children}
    </MarketingLayoutContext.Provider>
  );
}

export function useInMarketingLayout(): boolean {
  return useContext(MarketingLayoutContext);
}
