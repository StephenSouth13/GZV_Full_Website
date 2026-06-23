"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Bell, Shield, Globe, Palette, Key, Mail, Eye, EyeOff, Save, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface SettingsPanelProps {
  user: any
  onUpdateUser: (user: any) => void
}

const SettingsPanel = ({ user, onUpdateUser }: SettingsPanelProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    occupation: user.occupation || "",
    company: user.company || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
    achievementAlerts: true,
    mentorMessages: true,
    systemUpdates: true,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showProgress: true,
    showAchievements: true,
    allowMessages: true,
    showOnlineStatus: true,
  })

  const [preferences, setPreferences] = useState({
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    theme: "system",
    emailFrequency: "daily",
    autoplay: true,
    subtitles: true,
  })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onUpdateUser({
        ...user,
        ...profileData,
      })

      toast({
        title: "Thành công!",
        description: "Thông tin cá nhân đã được cập nhật.",
      })
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Lỗi!",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Lỗi!",
        description: "Mật khẩu mới phải có ít nhất 8 ký tự.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Thành công!",
        description: "Mật khẩu đã được thay đổi.",
      })
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể thay đổi mật khẩu. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Thành công!",
        description: "Cài đặt thông báo đã được lưu.",
      })
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể lưu cài đặt. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Thành công!",
        description: "Cài đặt quyền riêng tư đã được lưu.",
      })
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể lưu cài đặt. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Thành công!",
        description: "Tùy chọn đã được lưu.",
      })
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Không thể lưu tùy chọn. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Bảo mật</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Thông báo</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Riêng tư</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Tùy chọn</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa chỉ</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Nghề nghiệp</Label>
                  <Input
                    id="occupation"
                    value={profileData.occupation}
                    onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                    placeholder="Nhập nghề nghiệp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Công ty</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    placeholder="Nhập tên công ty"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                  rows={4}
                />
                <p className="text-sm text-gray-500">{profileData.bio.length}/500 ký tự</p>
              </div>

              <Button onClick={handleSaveProfile} disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-red-600" />
                  Thay đổi mật khẩu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Nhập mật khẩu mới"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Mật khẩu phải có ít nhất 8 ký tự</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleChangePassword} disabled={isLoading} variant="destructive">
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Thay đổi mật khẩu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Bảo mật tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Xác thực hai yếu tố (2FA)</h4>
                    <p className="text-sm text-gray-600">Tăng cường bảo mật cho tài khoản của bạn</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Chưa kích hoạt
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Phiên đăng nhập</h4>
                    <p className="text-sm text-gray-600">Quản lý các thiết bị đã đăng nhập</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Lịch sử hoạt động</h4>
                    <p className="text-sm text-gray-600">Xem lịch sử đăng nhập và hoạt động</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Xem lịch sử
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Cài đặt thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Thông báo chung</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Thông báo qua email</Label>
                      <p className="text-sm text-gray-600">Nhận thông báo quan trọng qua email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Thông báo đẩy</Label>
                      <p className="text-sm text-gray-600">Nhận thông báo trên trình duyệt</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Thông báo khóa học</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="courseUpdates">Cập nhật khóa học</Label>
                      <p className="text-sm text-gray-600">Thông báo khi có bài học mới</p>
                    </div>
                    <Switch
                      id="courseUpdates"
                      checked={notificationSettings.courseUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, courseUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="achievementAlerts">Thông báo thành tựu</Label>
                      <p className="text-sm text-gray-600">Thông báo khi đạt được thành tựu mới</p>
                    </div>
                    <Switch
                      id="achievementAlerts"
                      checked={notificationSettings.achievementAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, achievementAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentorMessages">Tin nhắn từ mentor</Label>
                      <p className="text-sm text-gray-600">Thông báo khi mentor gửi tin nhắn</p>
                    </div>
                    <Switch
                      id="mentorMessages"
                      checked={notificationSettings.mentorMessages}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, mentorMessages: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Marketing & Khuyến mãi</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Email marketing</Label>
                      <p className="text-sm text-gray-600">Nhận thông tin khuyến mãi và khóa học mới</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyDigest">Bản tin hàng tuần</Label>
                      <p className="text-sm text-gray-600">Tóm tắt hoạt động và khóa học nổi bật</p>
                    </div>
                    <Switch
                      id="weeklyDigest"
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemUpdates">Cập nhật hệ thống</Label>
                      <p className="text-sm text-gray-600">Thông báo bảo trì và cập nhật hệ thống</p>
                    </div>
                    <Switch
                      id="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Lưu cài đặt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Cài đặt quyền riêng tư
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Hiển thị hồ sơ</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">Ai có thể xem hồ sơ của bạn?</Label>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Công khai</SelectItem>
                        <SelectItem value="students">Chỉ học viên gzv</SelectItem>
                        <SelectItem value="private">Riêng tư</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showEmail">Hiển thị email</Label>
                      <p className="text-sm text-gray-600">Cho phép người khác xem email của bạn</p>
                    </div>
                    <Switch
                      id="showEmail"
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showPhone">Hiển thị số điện thoại</Label>
                      <p className="text-sm text-gray-600">Cho phép người khác xem số điện thoại</p>
                    </div>
                    <Switch
                      id="showPhone"
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showProgress">Hiển thị tiến độ học tập</Label>
                      <p className="text-sm text-gray-600">Cho phép người khác xem tiến độ khóa học</p>
                    </div>
                    <Switch
                      id="showProgress"
                      checked={privacySettings.showProgress}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showProgress: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showAchievements">Hiển thị thành tựu</Label>
                      <p className="text-sm text-gray-600">Cho phép người khác xem thành tựu của bạn</p>
                    </div>
                    <Switch
                      id="showAchievements"
                      checked={privacySettings.showAchievements}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({ ...privacySettings, showAchievements: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Tương tác</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowMessages">Cho phép nhận tin nhắn</Label>
                      <p className="text-sm text-gray-600">Học viên khác có thể gửi tin nhắn cho bạn</p>
                    </div>
                    <Switch
                      id="allowMessages"
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowMessages: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showOnlineStatus">Hiển thị trạng thái online</Label>
                      <p className="text-sm text-gray-600">Cho phép người khác biết bạn đang online</p>
                    </div>
                    <Switch
                      id="showOnlineStatus"
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({ ...privacySettings, showOnlineStatus: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Lưu ý về quyền riêng tư</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Một số thông tin như tên và ảnh đại diện sẽ luôn hiển thị công khai để đảm bảo trải nghiệm học tập
                      tốt nhất.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePrivacy} disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Lưu cài đặt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Tùy chọn cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger>
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</SelectItem>
                      <SelectItem value="Asia/Bangkok">GMT+7 (Bangkok)</SelectItem>
                      <SelectItem value="Asia/Singapore">GMT+8 (Singapore)</SelectItem>
                      <SelectItem value="Asia/Tokyo">GMT+9 (Tokyo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Giao diện</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Sáng</SelectItem>
                      <SelectItem value="dark">🌙 Tối</SelectItem>
                      <SelectItem value="system">🖥️ Theo hệ thống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFrequency">Tần suất email</Label>
                  <Select
                    value={preferences.emailFrequency}
                    onValueChange={(value) => setPreferences({ ...preferences, emailFrequency: value })}
                  >
                    <SelectTrigger>
                      <Mail className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Ngay lập tức</SelectItem>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="never">Không bao giờ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Tùy chọn video</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoplay">Tự động phát video</Label>
                      <p className="text-sm text-gray-600">Video sẽ tự động phát khi mở bài học</p>
                    </div>
                    <Switch
                      id="autoplay"
                      checked={preferences.autoplay}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, autoplay: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="subtitles">Hiển thị phụ đề</Label>
                      <p className="text-sm text-gray-600">Tự động hiển thị phụ đề khi có</p>
                    </div>
                    <Switch
                      id="subtitles"
                      checked={preferences.subtitles}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, subtitles: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePreferences} disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Lưu tùy chọn
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPanel
