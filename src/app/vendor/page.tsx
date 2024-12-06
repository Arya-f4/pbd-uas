import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import Vendor from "@/components/Vendor/Vendor";
import { ToastProvider } from "@/components/ui/UseToast";
export default function VendorPage() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <Vendor />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
