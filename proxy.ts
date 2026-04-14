import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/results/:path*",
    "/api/history/:path*",
    "/api/scan/:path*",
    "/api/chat/:path*",
    "/api/screenshot/:path*",
    "/api/whois/:path*",
    "/api/stats/:path*",
  ],
};
