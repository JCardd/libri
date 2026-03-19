import { PricingTable } from "@clerk/nextjs";

export default function SubscriptionsPage() {
  return (
    <main className="wrapper container py-12">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Unlock more books, longer sessions, and unlimited history.
        </p>
      </div>

      <div className="pricing-table-container">
        <PricingTable />
      </div>
    </main>
  );
}
