"use client"

import { DashboardSidebar } from "@/components/DashboardSidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import ThemeToggle from "@/components/ui/theme-toggle"
import { useUser, useClerk } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Mail,
    Phone,
    Calendar,
    Globe,
    Shield,
    Clock,
    Activity,
    ExternalLink,
    User,
    BadgeCheck,
    LogOut,
    Trash2,
    AlertTriangle,
} from "lucide-react"
import { formatDate } from "@/utils/dateUtils"
import { toast } from "sonner"

interface Monitor {
    id: string
    url: string
    status: "up" | "down"
    uptime: string
    lastCheck: string
    responseTime: string
    incidents: number
    interval: string
    owner?: string
    organization?: string
    createdAt: string
}

export default function AccountPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()
    const [monitors, setMonitors] = useState<Monitor[]>([])
    const [loadingMonitors, setLoadingMonitors] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (isSignedIn) {
            fetchMonitors()
        }
    }, [isSignedIn])

    const fetchMonitors = async () => {
        try {
            setLoadingMonitors(true)
            const response = await fetch("/api/monitors")
            if (response.ok) {
                const data = await response.json()
                setMonitors(data.monitors || [])
            }
        } catch (error) {
            console.error("Error fetching monitors:", error)
        } finally {
            setLoadingMonitors(false)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            setDeleting(true)
            const response = await fetch("/api/user/delete", { method: "DELETE" })

            if (response.ok) {
                toast.success("Account deleted successfully")
                await signOut()
                router.push("/")
            } else {
                const data = await response.json()
                toast.error(data.error || "Failed to delete account")
            }
        } catch (error) {
            console.error("Error deleting account:", error)
            toast.error("Something went wrong while deleting your account")
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        router.push("/")
    }

    const upCount = monitors.filter((m) => m.status === "up").length
    const downCount = monitors.filter((m) => m.status === "down").length

    return (
        <SidebarProvider>
            <DashboardSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard/account">Account</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center px-6">
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                    <div className="px-8 pt-4">
                        <h2 className="text-2xl font-bold text-foreground flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                            Account
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Your profile information and monitor overview
                        </p>
                    </div>

                    {!isLoaded ? (
                        <div className="px-8 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-24 rounded-xl bg-muted/50 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : isSignedIn && user ? (
                        <div className="px-8 space-y-6 pb-8">
                            {/* Profile Card */}
                            <div className="rounded-xl border bg-card overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center gap-5">
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={user.imageUrl}
                                                alt={user.fullName || "User"}
                                                className="w-20 h-20 rounded-2xl border-2 border-border shadow-lg object-cover"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                                {user.fullName || "User"}
                                                <BadgeCheck className="w-6 h-6 text-primary" />
                                            </h3>
                                            <p className="text-muted-foreground text-base mt-0.5">
                                                @{user.username || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "user"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats row — neutral colors */}
                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="bg-muted/40 rounded-xl p-4 text-center border hover:border-border transition-all">
                                            <div className="text-3xl font-bold text-foreground">{monitors.length}</div>
                                            <div className="text-sm text-muted-foreground mt-1">Total Monitors</div>
                                        </div>
                                        <div className="bg-muted/40 rounded-xl p-4 text-center border hover:border-border transition-all">
                                            <div className="text-3xl font-bold text-foreground">{upCount}</div>
                                            <div className="text-sm text-muted-foreground mt-1">Up</div>
                                        </div>
                                        <div className="bg-muted/40 rounded-xl p-4 text-center border hover:border-border transition-all">
                                            <div className="text-3xl font-bold text-foreground">{downCount}</div>
                                            <div className="text-sm text-muted-foreground mt-1">Down</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="rounded-xl border bg-card p-6">
                                    <h4 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Personal Information
                                    </h4>
                                    <div className="space-y-5">
                                        <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.primaryEmailAddress?.emailAddress || "Not set"} />
                                        <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={user.primaryPhoneNumber?.phoneNumber || "Not set"} />
                                        <InfoRow icon={<Globe className="w-4 h-4" />} label="Username" value={user.username || "Not set"} />
                                        <InfoRow icon={<User className="w-4 h-4" />} label="First Name" value={user.firstName || "Not set"} />
                                        <InfoRow icon={<User className="w-4 h-4" />} label="Last Name" value={user.lastName || "Not set"} />
                                    </div>
                                </div>

                                {/* Account Details */}
                                <div className="rounded-xl border bg-card p-6">
                                    <h4 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Account Details
                                    </h4>
                                    <div className="space-y-5">
                                        <InfoRow icon={<Shield className="w-4 h-4" />} label="User ID" value={user.id} mono />
                                        <InfoRow
                                            icon={<Calendar className="w-4 h-4" />}
                                            label="Joined"
                                            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown"}
                                        />
                                        <InfoRow
                                            icon={<Clock className="w-4 h-4" />}
                                            label="Last Sign In"
                                            value={user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                                        />
                                        <InfoRow
                                            icon={<Shield className="w-4 h-4" />}
                                            label="Two-Factor Auth"
                                            value={user.twoFactorEnabled ? "Enabled" : "Not enabled"}
                                            valueClass={user.twoFactorEnabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}
                                        />
                                        <InfoRow
                                            icon={<Mail className="w-4 h-4" />}
                                            label="Email Verified"
                                            value={user.primaryEmailAddress?.verification?.status === "verified" ? "Verified" : "Not verified"}
                                            valueClass={user.primaryEmailAddress?.verification?.status === "verified" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Monitors List */}
                            <div className="rounded-xl border bg-card p-6">
                                <h4 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Your Monitors
                                    <span className="ml-auto text-sm text-muted-foreground font-normal">
                                        {monitors.length} monitor{monitors.length !== 1 && "s"}
                                    </span>
                                </h4>

                                {loadingMonitors ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
                                        ))}
                                    </div>
                                ) : monitors.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-base">No monitors yet</p>
                                        <a href="/dashboard" className="text-sm text-primary hover:underline mt-2 inline-block">
                                            Go to dashboard to add monitors
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {monitors.map((monitor) => (
                                            <div
                                                key={monitor.id}
                                                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-all group"
                                            >
                                                <div
                                                    className={`w-3 h-3 rounded-full flex-shrink-0 ${monitor.status === "up"
                                                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                                        : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                        }`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-base text-foreground truncate">{monitor.url}</span>
                                                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
                                                        <span>{monitor.status === "up" ? "Up" : "Down"} {monitor.uptime}</span>
                                                        <span>•</span>
                                                        <span>Every {monitor.interval}</span>
                                                        {monitor.organization && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{monitor.organization}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-base font-medium text-foreground">{monitor.responseTime}</div>
                                                    <div className="text-sm text-muted-foreground">{formatDate(monitor.lastCheck)}</div>
                                                </div>
                                                <span
                                                    className={`text-sm font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${monitor.status === "up"
                                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                        }`}
                                                >
                                                    {monitor.status.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sign Out & Delete Account */}
                            <div className="rounded-xl border bg-card p-6 space-y-6">
                                <div>
                                    <h4 className="text-base font-semibold text-foreground mb-2">Sign Out</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Sign out of your account on this device.
                                    </p>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-foreground hover:bg-muted transition-all text-sm font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Permanently delete your account, all your monitors, and all associated data. This action cannot be undone.
                                    </p>

                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Account
                                        </button>
                                    ) : (
                                        <div className="border border-red-500/30 rounded-xl p-4 bg-red-500/5">
                                            <div className="flex items-start gap-3 mb-4">
                                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Are you absolutely sure?</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        This will permanently delete your account from both our database and Clerk, remove all {monitors.length} monitor{monitors.length !== 1 && "s"}, and redirect you to the home page.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleting}
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {deleting ? "Deleting..." : "Yes, delete my account"}
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    disabled={deleting}
                                                    className="px-5 py-2.5 rounded-lg border text-sm font-medium text-foreground hover:bg-muted transition-all disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-8 text-center py-20 text-muted-foreground">
                            <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>Please sign in to view your account</p>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

function InfoRow({
    icon,
    label,
    value,
    mono,
    valueClass,
}: {
    icon: React.ReactNode
    label: string
    value: string
    mono?: boolean
    valueClass?: string
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div
                    className={`text-base mt-0.5 break-all ${mono ? "font-mono text-sm" : ""} ${valueClass || "text-foreground"}`}
                >
                    {value}
                </div>
            </div>
        </div>
    )
}
