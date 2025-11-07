import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";

interface PinAuthProps {
  onAuthSuccess: () => void;
}

export function PinAuth({ onAuthSuccess }: PinAuthProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập trong session này
    const isAuthenticated = sessionStorage.getItem("pinAuthenticated");
    if (isAuthenticated === "true") {
      onAuthSuccess();
    }
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên đăng nhập và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Logging in via API...");

      // Call API to verify PIN - Changed to login API
      const response = await fetch("https://4beac38c-34b4-47be-8df2-4a7d6f34c6b5-00-yd16h0ayqss7.pike.replit.dev/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Lưu trạng thái đăng nhập vào sessionStorage
        sessionStorage.setItem("pinAuthenticated", "true");
        sessionStorage.setItem("currentUser", JSON.stringify(data.user)); // Assuming user data is returned
        localStorage.setItem("domain", data.user.domain);

        console.log("✅ Login successful");
        onAuthSuccess();
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: data.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
          variant: "destructive",
        });
        setPassword("");
        setUsername(""); // Clear username as well
        console.log("❌ Login failed");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.",
        variant: "destructive",
      });
      setPassword("");
      setUsername(""); // Clear username as well
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 0%, transparent 50%),
                           radial-gradient(circle at 75% 25%, #ffffff 0%, transparent 50%),
                           radial-gradient(circle at 25% 75%, #ffffff 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #ffffff 0%, transparent 50%)`,
            backgroundSize: "100px 100px",
          }}
        ></div>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Đăng nhập hệ thống
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Nhập tên đăng nhập và mật khẩu để truy cập
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-semibold text-gray-800 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-green-600" />
                Mã số thuế
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập mã số thuế"
                className="h-12 px-4 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all rounded-lg"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-800 flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-green-600" />
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập mật khẩu"
                  className="h-12 px-4 pr-12 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all rounded-lg"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-600" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              💡 Liên hệ quản trị viên nếu bạn quên mật khẩu
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}