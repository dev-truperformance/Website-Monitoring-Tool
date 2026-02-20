"use client"

import { DashboardSidebar } from "@/components/DashboardSidebar"
import MonitorCard from "@/components/MonitorCard"
import AddMonitorModal from "@/components/AddMonitorModal"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Filter, Plus, Search, Settings, Trash2, ArrowUpDown, X, Check, Pause } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

type StatusFilter = 'all' | 'up' | 'down'
type SortOption = 'down-first' | 'up-first' | 'name-asc' | 'name-desc' | 'newest' | 'oldest'

const SORT_LABELS: Record<SortOption, string> = {
  'down-first': 'Down first',
  'up-first': 'Up first',
  'name-asc': 'Name A→Z',
  'name-desc': 'Name Z→A',
  'newest': 'Newest first',
  'oldest': 'Oldest first',
}

interface Monitor {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'paused';
  intervalSeconds: number;
  timeoutSeconds: number;
  isActive: boolean;
  uptimePercentage: number;
  lastCheckAt: string;
  responseTimeMs: number;
  createdAt: string;
  updatedAt: string;
  
  // Legacy fields for compatibility
  uptime: string;
  lastCheck: string;
  responseTime: string;
  incidents: number;
  interval: string;
  owner?: string;
  organization?: string;
  isMonitoringActive?: boolean;
}

export default function Page() {
  const { user, isSignedIn } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [monitors, setMonitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('down-first')
  const [showFilters, setShowFilters] = useState(false)
  const filterPanelRef = useRef<HTMLDivElement>(null)

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setShowFilters(false)
      }
    }
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showFilters])

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  // Sync user data when they land on dashboard
  useEffect(() => {
    if (isSignedIn && user) {
      console.log("🏠 Dashboard: User detected, syncing to database");
      syncUserToDatabase(user);
    }
  }, [isSignedIn, user]);

  // Fetch real-time monitoring status
  const fetchMonitoringStatus = async () => {
    try {
      const response = await fetch('/api/monitoring/status');
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Real-time monitoring status:', data);
          
          // Update monitors with real-time status from monitoring service
          setMonitors(prevMonitors => 
            prevMonitors.map(monitor => {
              // Get real-time status from monitoring service
              const realTimeStatus = data.status?.currentStatuses?.[monitor.id] || 'unknown';
              const isActive = data.status?.jobs?.includes(monitor.id);
              
              return {
                ...monitor,
                status: realTimeStatus,
                isMonitoringActive: isActive // Add monitoring state
              };
            })
          );
        }
      } catch (error) {
        console.error('Error fetching monitoring status:', error);
      }
    };

  // Fetch monitors from database
  useEffect(() => {
    fetchMonitors();
    
    // Fetch monitoring status every 30 seconds
    const statusInterval = setInterval(fetchMonitoringStatus, 30000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const fetchMonitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitors');

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Monitors fetched:", data);
        
        // Transform new API data to legacy format for compatibility
        const transformedMonitors = data.monitors.map((monitor: any) => ({
          ...monitor,
          // Legacy fields for backward compatibility
          uptime: `${monitor.uptimePercentage || 100}%`,
          lastCheck: monitor.lastCheckAt,
          responseTime: monitor.responseTimeMs ? `${monitor.responseTimeMs}ms` : '0ms',
          incidents: 0, // Would need to be calculated from incidents table
          interval: `${monitor.intervalSeconds}s`,
          owner: undefined, // Would need to fetch from user data
          organization: monitor.organizationId,
          isMonitoringActive: monitor.isActive,
        }));
        
        setMonitors(transformedMonitors);
        
        // Start server monitoring service
        await fetch('/api/monitoring/start', { method: 'POST' });
      } else {
        console.error("❌ Failed to fetch monitors");
      }
    } catch (error) {
      console.error("❌ Error fetching monitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncUserToDatabase = async (clerkUser: any) => {
    console.log("🔄 Dashboard: Starting database sync for user:", clerkUser.id);

    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("📡 Dashboard: Sync API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dashboard: User synced to database:", data);
      } else {
        const errorData = await response.text();
        console.error("❌ Dashboard: Failed to sync user to database:", response.status, errorData);
      }
    } catch (error) {
      console.error("❌ Dashboard: Error syncing user to database:", error);
    }
  };

  // Debounce search term with 3s delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter and sort monitors
  const filteredMonitors = useMemo(() => {
    let result = [...monitors]

    // 1. Search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      result = result.filter(monitor =>
        monitor.url.toLowerCase().includes(searchLower) ||
        monitor.status.toLowerCase().includes(searchLower) ||
        (monitor.owner && monitor.owner.toLowerCase().includes(searchLower)) ||
        (monitor.organization && monitor.organization.toLowerCase().includes(searchLower))
      )
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      result = result.filter(monitor => monitor.status === statusFilter)
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'down-first':
          if (a.status === 'down' && b.status !== 'down') return -1
          if (a.status !== 'down' && b.status === 'down') return 1
          return 0
        case 'up-first':
          if (a.status === 'up' && b.status !== 'up') return -1
          if (a.status !== 'up' && b.status === 'up') return 1
          return 0
        case 'name-asc':
          return a.url.localeCompare(b.url)
        case 'name-desc':
          return b.url.localeCompare(a.url)
        case 'newest':
          return new Date(b.lastCheck).getTime() - new Date(a.lastCheck).getTime()
        case 'oldest':
          return new Date(a.lastCheck).getTime() - new Date(b.lastCheck).getTime()
        default:
          return 0
      }
    })

    return result
  }, [monitors, debouncedSearchTerm, statusFilter, sortOption])

  const handleAddMonitor = async (newMonitor: { url: string; type: string; interval: string; organization?: string }) => {
    try {
      // Get user's organizations to find the correct one
      const orgsResponse = await fetch('/api/organizations');
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        const userOrganizations = orgsData.organizations || [];
        
        // Use the provided organization or the most recently created one
        let targetOrgId = newMonitor.organization;
        if (!targetOrgId && userOrganizations.length > 0) {
          // If no organization specified, use the most recently created one
          const mostRecentOrg = userOrganizations.reduce((latest: any, current: any) => {
            return new Date(latest.createdAt) > new Date(current.createdAt) ? latest : current;
          });
          targetOrgId = mostRecentOrg.organizationId;
        }
        
        if (!targetOrgId) {
          toast.error("No organization available. Please create an organization first.");
          return;
        }
      
        const response = await fetch('/api/monitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: newMonitor.url, 
            name: newMonitor.url, // Use URL as name for now
            organizationId: targetOrgId
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Monitor created:", data);
          toast.success("Monitor added successfully!");
          
          // Add new monitor to existing monitoring service
          if (data.monitor) {
            await fetch('/api/monitoring/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ monitor: data.monitor })
            });
          }
          
          // Refresh monitors list
          fetchMonitors();
        } else {
          console.error("❌ Failed to create monitor");
          toast.error("Failed to create monitor");
        }
      } else {
        console.error("❌ Failed to fetch organizations");
        toast.error("Failed to get organizations");
      }
    } catch (error) {
      console.error("❌ Error creating monitor:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleViewDetails = (monitor: Monitor) => {
    // For now, we can show an alert or open a modal
    // In the future, this could open a detailed view page
    alert(`Monitor Details:\n\nURL: ${monitor.url}\nStatus: ${monitor.status}\nUptime: ${monitor.uptime}\nInterval: ${monitor.interval}\nOwner: ${monitor.owner || 'N/A'}\nOrganization: ${monitor.organization || 'N/A'}\nResponse Time: ${monitor.responseTime}\nIncidents: ${monitor.incidents}\nLast Check: ${monitor.lastCheck}`);
  };

  const handleStartMonitor = async (id: string) => {
    try {
      const response = await fetch('/api/monitoring/start/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitorId: id })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Monitor started:", data);
        toast.success("Monitor started successfully!");
        
        // Refresh monitoring status
        fetchMonitoringStatus();
      } else {
        console.error("❌ Failed to start monitor");
        toast.error("Failed to start monitor");
      }
    } catch (error) {
      console.error("❌ Error starting monitor:", error);
      toast.error("Error starting monitor");
    }
  };

  const handleStopMonitor = async (id: string) => {
    try {
      const response = await fetch('/api/monitoring/stop/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitorId: id })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Monitor stopped:", data);
        toast.success("Monitor stopped successfully!");
        
        // Refresh monitoring status
        fetchMonitoringStatus();
      } else {
        console.error("❌ Failed to stop monitor");
        toast.error("Failed to stop monitor");
      }
    } catch (error) {
      console.error("❌ Error stopping monitor:", error);
      toast.error("Error stopping monitor");
    }
  };

  const handleStopAllMonitoring = async () => {
    try {
      const response = await fetch('/api/monitoring/stop/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ All monitoring stopped:", data);
        toast.success("All monitoring stopped successfully!");
        
        // Refresh monitoring status
        fetchMonitoringStatus();
      } else {
        console.error("❌ Failed to stop all monitoring");
        toast.error("Failed to stop all monitoring");
      }
    } catch (error) {
      console.error("❌ Error stopping all monitoring:", error);
      toast.error("Error stopping all monitoring");
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    try {
      const response = await fetch(`/api/monitors?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log("✅ Monitor deleted");
        toast.success("Monitor deleted successfully!");
        
        // Refresh monitors list
        fetchMonitors();
      } else {
        console.error("❌ Failed to delete monitor");
        toast.error("Failed to delete monitor");
      }
    } catch (error) {
      console.error("❌ Error deleting monitor:", error);
      toast.error("Error deleting monitor");
    }
  };

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
                  <BreadcrumbLink href="#">
                    A centralize platform for website monitoring
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center px-6">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className=" px-8 pb-4">
              <div className="flex items-center justify-between mb-4">
              </div>
            {/* Controls */}
            <div className="px-8 py-4 border-b">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search monitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-all duration-200"
                  />
                </div>

                {/* Stop All button */}
                {monitors.length > 0 && (
                  <button
                    onClick={handleStopAllMonitoring}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Stop All
                  </button>
                )}

                {/* Filters button */}
                <div className="relative" ref={filterPanelRef}>
                  <button
                    onClick={() => setShowFilters(prev => !prev)}
                    className={`flex items-center px-4 py-3 border rounded-lg text-sm transition-all duration-200 shadow-sm ${showFilters || activeFilterCount > 0
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'text-foreground hover:bg-accent'
                      }`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Filter dropdown panel */}
                  {showFilters && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-background border rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-foreground">Filter by Status</span>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={() => setStatusFilter('all')}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(['all', 'up', 'down'] as StatusFilter[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${statusFilter === status
                              ? status === 'up'
                                ? 'bg-green-500/15 border-green-500 text-green-600 dark:text-green-400'
                                : status === 'down'
                                  ? 'bg-red-500/15 border-red-500 text-red-600 dark:text-red-400'
                                  : 'bg-primary/10 border-primary text-primary'
                              : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                              }`}
                          >
                            {status === 'all' && 'All'}
                            {status === 'up' && '● Up'}
                            {status === 'down' && '● Down'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center px-4 py-3 border rounded-lg text-sm text-foreground hover:bg-accent transition-all duration-200 shadow-sm">
                      {SORT_LABELS[sortOption]}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSortOption(option)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        {SORT_LABELS[option]}
                        {sortOption === option && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Monitor Cards */}
            <div className="px-8 py-6">
              <div className="grid gap-4">
                {filteredMonitors.map((monitor) => (
                  <MonitorCard
                    key={monitor.id}
                    monitor={monitor}
                    onDelete={handleDeleteMonitor}
                    onViewDetails={handleViewDetails}
                    onStartMonitor={handleStartMonitor}
                    onStopMonitor={handleStopMonitor}
                  />
                ))}
                {filteredMonitors.length === 0 && (debouncedSearchTerm || statusFilter !== 'all') && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Filter className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                      No monitors found
                      {debouncedSearchTerm && <> matching &quot;{debouncedSearchTerm}&quot;</>}
                      {statusFilter !== 'all' && <> with status <span className="font-semibold">{statusFilter}</span></>}
                    </p>
                    <button
                      onClick={() => { setSearchTerm(''); setDebouncedSearchTerm(''); setStatusFilter('all'); }}
                      className="mt-3 text-xs text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
                {monitors.length === 0 && !loading && !debouncedSearchTerm && statusFilter === 'all' && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium text-foreground">No monitors yet</p>
                    <p className="text-sm mt-1">Add your first monitor to start tracking your websites.</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add your first monitor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </SidebarInset>
      <AddMonitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMonitor={handleAddMonitor}
      />
    </SidebarProvider>
  )
}


