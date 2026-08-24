import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Citizen AQI report mutations and queries
 */

export const create = mutation({
  args: {
    lat: v.number(),
    lng: v.number(),
    severity: v.number(),
    reportType: v.string(),
    description: v.optional(v.string()),
    timestamp: v.number(),
    photoUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    mediaType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const id = await ctx.db.insert("citizenReports", {
      userId: identity?.subject,
      lat: args.lat,
      lng: args.lng,
      severity: args.severity,
      reportType: args.reportType,
      description: args.description,
      timestamp: args.timestamp,
      photoUrl: args.photoUrl,
      videoUrl: args.videoUrl,
      mediaType: args.mediaType,
    });
    return id;
  },
});

export const list = query({
  args: {
    hoursBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hoursBack = args.hoursBack ?? 24;
    const since = Date.now() - hoursBack * 60 * 60 * 1000;

    const reports = await ctx.db
      .query("citizenReports")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", since))
      .collect();

    return reports;
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("citizenReports").collect().then((r) => r.length);
  },
});
