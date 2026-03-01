import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { usePurchaseStore } from '../store/usePurchaseStore';

// Replace with your actual RevenueCat API keys
const REVENUECAT_IOS_KEY = 'YOUR_REVENUECAT_IOS_API_KEY';
const REVENUECAT_ANDROID_KEY = 'YOUR_REVENUECAT_ANDROID_API_KEY';

export const PRO_ENTITLEMENT_ID = 'pro';

export async function initPurchases() {
  const key = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  if (key.startsWith('YOUR_')) return; // Skip if not configured
  Purchases.configure({ apiKey: key });
  await checkEntitlement();
}

export async function checkEntitlement() {
  try {
    const info = await Purchases.getCustomerInfo();
    const isPro = typeof info.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';
    usePurchaseStore.getState().setPro(isPro);
  } catch {
    // Silently fail — offline or not configured
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = typeof customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';
    usePurchaseStore.getState().setPro(isPro);
    return isPro;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    const isPro = typeof info.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';
    usePurchaseStore.getState().setPro(isPro);
    return isPro;
  } catch {
    return false;
  }
}
