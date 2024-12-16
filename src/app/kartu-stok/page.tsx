import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import StockCard from "@/components/Kartu-stok/StockCard";
import { ToastProvider } from "@/components/ui/UseToast";
export default function VendorPage() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <StockCard />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
