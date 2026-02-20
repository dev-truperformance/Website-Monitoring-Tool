'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "@/components/ui/theme-toggle";
import Image from "next/image";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-auto h-10 relative flex items-center justify-center">
              <Image src="/tru-light.webp" alt="Logo" width={170} height={70} className="block dark:hidden object-contain" />
              <Image src="/tru-dark.webp" alt="Logo dark" width={170} height={70} className="hidden dark:block object-contain" />
            </div>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#why-us" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Why Us
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignedOut>
              <Link href="/sign-in">
                <Button size="sm" variant="outline">Login</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-15 md:py-28 lg:py-35">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Website Uptime Monitor</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Monitor. Detect. Alert.
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Protect Your Revenue
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
              Your website should never go down without you knowing.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Monitor uptime every 5 minutes and get intelligent alerts only when it truly matters.
            </p>
            
            <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
              Every minute of downtime costs you revenue, trust, and reputation. 
              MonitorWeb gives you real-time visibility into your critical websites with instant alerts 
              so you can act before your users notice anything.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg" className="bg-[#FF5A24] text-white text-lg px-8 py-6 group hover:bg-[#FF5A24]/90">
                    Start Monitoring Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#FF5A24] text-white text-lg px-8 py-6 group hover:bg-[#FF5A24]/90">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </SignedIn>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-primary">&lt;60s</div>
              <div className="text-sm text-muted-foreground">Alert Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-primary">30+</div>
              <div className="text-sm text-muted-foreground">Global Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Monitoring Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Smart Monitoring & Intelligent Alerts
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ignores short, temporary outages</h3>
                  <p className="text-muted-foreground">Smart filtering prevents alert fatigue from brief network hiccups</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Triggers alerts only when downtime exceeds configured thresholds</h3>
                  <p className="text-muted-foreground">Customizable thresholds ensure you only get notified for real issues</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Evaluates real HTTP response codes like 200, 503, 504</h3>
                  <p className="text-muted-foreground">Accurate monitoring based on actual server responses</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Detects status transitions (UP → DOWN / DOWN → UP)</h3>
                  <p className="text-muted-foreground">Real-time tracking of website state changes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email alerts are sent when:</h3>
                  <ul className="text-muted-foreground mt-2 space-y-1">
                    <li>• Website status changes</li>
                    <li>• Downtime crosses defined limits</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg" className="bg-[#FF5A24] text-white text-lg px-8 py-6 group hover:bg-[#FF5A24]/90">
                    Monitor My Website Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#FF5A24] text-white text-lg px-8 py-6 group hover:bg-[#FF5A24]/90">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Plans Built for Growing Teams
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Tier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Limited website monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Basic uptime tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Limited historical data</span>
                  </div>
                </div>
                <Link href="/sign-up">
                  <Button className="w-full mt-6" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Paid Tier */}
            <Card className="border-2 border-primary hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Paid Tier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Monitor multiple websites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Extended log retention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Advanced downtime alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Priority notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Subscription management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Upgrade or downgrade anytime</span>
                  </div>
                </div>
                <Link href="/sign-up">
                  <Button className="w-full mt-6 bg-[#FF5A24] hover:bg-[#FF5A24]/90">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Don&apos;t Wait for Customers to Tell You Your Site Is Down
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get proactive monitoring, intelligent alerts, and performance insights all in one place.
              </p>
              
              <div className="max-w-md mx-auto mb-8">
                <SignedOut>
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Link href="/sign-up">
                      <Button size="lg" className="w-full bg-[#FF5A24] text-white text-lg py-4 hover:bg-[#FF5A24]/90">
                        Start Monitoring Free Today
                      </Button>
                    </Link>
                  </div>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full bg-[#FF5A24] text-white text-lg py-4 hover:bg-[#FF5A24]/90">
                      Go to Dashboard
                    </Button>
                  </Link>
                </SignedIn>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}