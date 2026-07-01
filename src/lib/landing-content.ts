import type { LandingAssetRecord } from "./assets";

export type LandingAssetSlot = "homeHero" | "packageHero" | "petHero";

export interface LandingContentResponse {
  version: string;
  source: "static-default" | "r2";
  assets: Record<LandingAssetSlot, LandingAssetRecord>;
}

export const landingContent: LandingContentResponse = {
  version: "2026-07-01",
  source: "static-default",
  assets: {
    homeHero: {
      key: "landing/homeHero/default-hero-home.png",
      use: "homeHero",
      url: "/assets/hero-home.png",
      contentType: "image/png",
      width: 1600,
      height: 900,
      alt: "Storyboard of a home dashboard with camera events, moments worth keeping, and smart-home action suggestions.",
      updatedAt: "2026-07-01T00:00:00.000Z"
    },
    packageHero: {
      key: "landing/packageHero/default-hero-package.png",
      use: "packageHero",
      url: "/assets/hero-package.png",
      contentType: "image/png",
      width: 1600,
      height: 900,
      alt: "Storyboard of a front porch camera view with a delivered package and an event timeline.",
      updatedAt: "2026-07-01T00:00:00.000Z"
    },
    petHero: {
      key: "landing/petHero/default-hero-pets.png",
      use: "petHero",
      url: "/assets/hero-pets.png",
      contentType: "image/png",
      width: 1600,
      height: 900,
      alt: "Storyboard of a pet moment captured by a home camera and organized into highlight clips.",
      updatedAt: "2026-07-01T00:00:00.000Z"
    }
  }
};
