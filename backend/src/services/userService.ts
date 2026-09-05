import { prisma } from "../lib/prisma.js";
import { DemoUser } from "../types/index.js";

const DEMO_USER_EMAIL = "demo@foodfinder.local";

export async function getOrCreateDemoUser(): Promise<DemoUser> {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    stripeCustomerId: user.stripeCustomerId,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionId: user.subscriptionId,
  };
}

export async function updateDemoUserStripeCustomerId(
  customerId: string
): Promise<void> {
  await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: { stripeCustomerId: customerId },
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      stripeCustomerId: customerId,
    },
  });
}

export async function updateDemoUserSubscription(
  subscriptionId: string,
  status: string
): Promise<void> {
  await prisma.user.update({
    where: { email: DEMO_USER_EMAIL },
    data: {
      subscriptionId,
      subscriptionStatus: status,
    },
  });
}

export async function getDemoUserSubscriptionStatus(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { subscriptionStatus: true },
  });

  return user?.subscriptionStatus ?? "inactive";
}
