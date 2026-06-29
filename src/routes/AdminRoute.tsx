import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function AdminRoute({
  children,
}: Props) {
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  );

  if (currentUser.role !== "Admin") {
    return <Navigate to="/" />;
  }

  return children;
}