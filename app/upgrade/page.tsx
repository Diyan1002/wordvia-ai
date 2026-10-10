import UpgradeClient from "./UpgradeClient";

type UpgradePageProps = {
  searchParams: Promise<{
    plan?: string;
  }>;
};

export default async function UpgradePage({
  searchParams,
}: UpgradePageProps) {

  const params = await searchParams;

  const plan =
    params.plan?.toLowerCase() === "business"
      ? "business"
      : "pro";

  return (
    <UpgradeClient plan={plan} />
  );
}