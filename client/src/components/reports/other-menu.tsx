import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe, Power, ChevronRight, Lock } from "lucide-react";
import { useTranslation, useLanguageStore, type Language } from "@/lib/i18n";
import logoPath from "@assets/EDPOS_1753091767028.png";

interface OtherMenuProps {
  onBack: () => void;
  onLogout: () => void;
}

export function OtherMenu({ onBack, onLogout }: OtherMenuProps) {
  const { t, currentLanguage } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const languages = [
    { code: "vi" as Language, name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en" as Language, name: "English", flag: "🇺🇸" },
    { code: "ko" as Language, name: "한국어", flag: "🇰🇷" },
  ];

  const getCurrentLanguage = () => {
    return (
      languages.find((lang) => lang.code === currentLanguage) || languages[0]
    );
  };

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    setShowLanguageModal(false);
    // Force a re-render by reloading the page to ensure all translations are updated
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);

    // Clear authentication state from sessionStorage
    sessionStorage.removeItem("pinAuthenticated");
    localStorage.removeItem("dashboard-date-range");
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("domain");

    // Call the logout callback
    onLogout();

    // Reload the page to return to PIN authentication screen
    window.location.reload();
  };

  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!passwordForm.currentPassword) {
      errors.currentPassword = t("settings.enterCurrentPassword");
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = t("settings.enterNewPassword");
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = t("settings.passwordMinLength");
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = t("settings.confirmNewPassword");
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t("settings.passwordMismatch");
    }

    setPasswordErrors(errors);
    return !Object.values(errors).some((error) => error !== '');
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      // Get username from sessionStorage or use a default
      const storedUser = sessionStorage.getItem('currentUser');
      const username = storedUser ? JSON.parse(storedUser).userName : undefined;

      const response = await fetch('https://api-pos-login.edpos.vn/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          username: username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("settings.passwordChangeFailed"));
      }

      // Success
      alert(t("settings.passwordChangeSuccess"));
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : t("settings.passwordChangeFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-700"
            onClick={() => {
              // Clear URL parameters when going back
              if (window.location.search) {
                const url = new URL(window.location.href);
                url.search = "";
                window.history.pushState({}, "", url.toString());
              }
              onBack();
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t("nav.other") || "KHÁC"}</h1>
        </div>
        <div className="flex items-center">
          <img
            src={logoPath}
            alt="EDPOS Logo"
            className="h-8 md:h-12 object-contain"
            onError={(e) => {
              console.error("Failed to load logo image");
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-3">
        {/* Language Settings */}
        <Card
          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowLanguageModal(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Globe className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {t("settings.changeLanguage") || "Thiết lập ngôn ngữ"}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card
          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowChangePassword(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Lock className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {t("settings.changePassword")}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card
          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleLogoutClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Power className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {t("nav.logout") || "Đăng xuất"}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Selection Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="bg-green-600 text-white p-4 -m-6 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-green-700"
                  onClick={() => setShowLanguageModal(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <DialogTitle className="text-lg font-semibold">
                  {t("settings.changeLanguage") || "Thiết lập ngôn ngữ"}
                </DialogTitle>
              </div>
              <div className="flex items-center">
                <img
                  src={logoPath}
                  alt="EDPOS Logo"
                  className="h-8 md:h-12 object-contain"
                  onError={(e) => {
                    console.error("Failed to load logo image");
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-2 -mt-2">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  currentLanguage === lang.code
                    ? "bg-green-50 border border-green-200"
                    : ""
                }`}
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {lang.code.toUpperCase()}{" "}
                      <span className="text-gray-600">{lang.name}</span>
                    </div>
                  </div>
                  {currentLanguage === lang.code && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="bg-green-600 text-white p-4 -m-6 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-green-700"
                  onClick={() => setShowChangePassword(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <DialogTitle className="text-lg font-semibold">
                  {t("settings.changePassword")}
                </DialogTitle>
              </div>
              <div className="flex items-center">
                <img
                  src={logoPath}
                  alt="EDPOS Logo"
                  className="h-8 md:h-12 object-contain"
                  onError={(e) => {
                    console.error("Failed to load logo image");
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 -mt-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                }}
                placeholder={t("settings.enterCurrentPassword")}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, newPassword: '' });
                }}
                placeholder={t("settings.enterNewPassword")}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                  setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                }}
                placeholder={t("settings.confirmNewPassword")}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(false)}
              className="px-6"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleChangePassword}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {t("settings.changePassword")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("nav.logout") || "Đăng xuất"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("common.confirmLogout") ||
                "Bạn có chắc chắn muốn đăng xuất không?"}
            </p>
            <DialogFooter className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6"
              >
                {t("common.cancel") || "Hủy"}
              </Button>
              <Button
                onClick={confirmLogout}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {t("nav.logout") || "Đăng xuất"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
