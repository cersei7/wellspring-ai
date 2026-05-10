'use client';
import DonationIntake from '@/components/DonationIntake';
import DistributionPanel from '@/components/DistributionPanel';
import ReportViewer from '@/components/ReportViewer';
import InventoryGrid from '@/components/InventoryGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  return (
    <main className="container mx-auto p-6 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">WellSpring AI</h1>
        <p className="text-muted-foreground">
          Smart donation management for women's centers
        </p>
      </header>

      <Tabs defaultValue="intake">
        <TabsList>
          <TabsTrigger value="intake">Intake</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="distribute">Distribute</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="intake"><DonationIntake /></TabsContent>
        <TabsContent value="inventory"><InventoryGrid /></TabsContent>
        <TabsContent value="distribute"><DistributionPanel /></TabsContent>
        <TabsContent value="reports"><ReportViewer /></TabsContent>
      </Tabs>
    </main>
  );
}
