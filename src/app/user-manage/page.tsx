import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ServerTokenProvider from "../ServerTokenProvider";
import Vendor from "@/components/Vendor/Vendor";
import { ToastProvider } from "@/components/ui/UseToast";
import UserManage from "@/components/UserManage/UserManage";
export default function VendorPage() {
  return (
    <ServerTokenProvider>
      <DefaultLayout>
        <ToastProvider>
          <UserManage />
        </ToastProvider>
      </DefaultLayout>
    </ServerTokenProvider>
  );
}
