"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";

// Get all settings
export async function getSettings() {
  try {
    const settings = await prisma.appSettings.findMany();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {};
  }
}

// Get single setting value
export async function getSetting(
  key: string,
  defaultValue: string = ""
): Promise<string> {
  try {
    const setting = await prisma.appSettings.findUnique({
      where: { key },
    });
    return setting?.value || defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

// Update or create setting
export async function updateSetting(
  key: string,
  value: string,
  description?: string
): Promise<ActionResult> {
  try {
    await prisma.appSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value, description },
    });

    revalidatePath("/dashboard/settings");

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Setting Updated",
      successDesc: `${key} has been updated successfully`,
    };
  } catch (error) {
    console.error("Error updating setting:", error);
    return {
      errorTitle: "Failed",
      errorDesc: "Failed to update setting",
      successTitle: null,
      successDesc: null,
    };
  }
}

// Initialize default settings
export async function initializeDefaultSettings() {
  const defaults = [
    {
      key: "round_trip_discount",
      value: "10",
      description: "Discount percentage for round trip bookings",
    },
  ];

  for (const setting of defaults) {
    await prisma.appSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
}
