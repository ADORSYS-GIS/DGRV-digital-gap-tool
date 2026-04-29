import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, BookOpen, ChevronRight, FileText, Settings, Users, Activity, BarChart4, AlertTriangle, AlertCircle, CheckCircle2, Download, Smartphone, HelpCircle, Book, Route } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const ManualGuidePage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isGlobalAdminPath = location.pathname.startsWith("/admin");
    const isOrgAdminPath = location.pathname.startsWith("/second-admin");
    const isCoopAdminPath = location.pathname.startsWith("/third-admin");
    const isUserPath = location.pathname.startsWith("/user");

    let backLink = "/";
    if (isGlobalAdminPath) backLink = "/admin/dashboard";
    else if (isOrgAdminPath) backLink = "/second-admin/dashboard";
    else if (isCoopAdminPath) backLink = "/third-admin/dashboard";
    else if (isUserPath) backLink = "/user/dashboard";

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-background">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
                <Link to={backLink}>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-4 mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
                <div className="bg-primary/20 p-4 rounded-xl">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/80 mb-1">DGRV Digital Gap Assessment Tool: Official</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Operational Handbook</h1>
                </div>
            </div>

            {/* Section 1: Intro - Visible to all */}
            <Card className="border-0 shadow-sm bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Route className="h-6 w-6 text-primary" />
                        1. System Introduction & Core Vision
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm leading-relaxed">
                    <p className="text-muted-foreground text-base">
                        The Digital Gap Assessment Tool is a professional orchestration platform designed to measure and drive digital transformation across the DGRV hierarchy. The system is built on a four-tier architecture, ensuring that global standards are localized and actioned by cooperatives in the field. This handbook provides an explicit, step-by-step guide for each user role, aligned with the actual interface and terminology of the application.
                    </p>
                    <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                        <h4 className="font-semibold text-lg text-foreground mb-4 border-b border-border/50 pb-2">
                            1.1 Key Concepts & Standard Terminology
                        </h4>
                        <p className="text-muted-foreground mb-3 font-medium">To ensure seamless communication, the platform uses the following professional standards:</p>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Organization:</strong> <span className="text-muted-foreground">A Regional Union or partner institution managed by DGRV.</span></li>
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Cooperative:</strong> <span className="text-muted-foreground">A local branch or member institution of an Organization.</span></li>
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Dimension:</strong> <span className="text-muted-foreground">A strategic area of digital maturity (e.g., "Digital Services").</span></li>
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Digitalisation Level:</strong> <span className="text-muted-foreground">A specific stage of maturity (Levels 1 to 5) within a Dimension.</span></li>
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Assessment Cycle:</strong> <span className="text-muted-foreground">A designated timeframe for evaluating digital progress.</span></li>
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Digitalisation Gap:</strong> <span className="text-muted-foreground">The identified deficit between Current and Desired states.</span></li>
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Action Plan:</strong> <span className="text-muted-foreground">A localized strategy generated to fix identified gaps.</span></li>
                            <li className="flex items-start gap-2 bg-muted/40 p-3 rounded-lg"><strong className="text-foreground min-w-[30%]">Severity:</strong> <span className="text-muted-foreground">The calculated risk weight (Low, Medium, High).</span></li>
                        </ul>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm">
                        <h4 className="font-semibold text-lg text-primary mb-3">1.2 Digitalisation Gap Analysis: The Engine</h4>
                        <p className="text-muted-foreground text-base mb-3 mb-2">The platform's "Digitalisation Gap Analysis" tool is the core intelligence component. It evaluates the distance between "Where you are" and "Where you want to be."</p>
                        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>It uses expert inputs defined by the DGRV Admin.</li>
                            <li>It produces localized recommendations instantly.</li>
                            <li>It generates professional PDF reports for stakeholders.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Level 1: Global Admin */}
            {isGlobalAdminPath && (
                <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-8 border-b border-border/50">
                        <CardTitle className="flex items-center text-2xl">
                            <Settings className="mr-3 h-7 w-7 text-primary" />
                            2. Level 1: The Global Admin (The DGRV Super Admin)
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            The Global Admin acts as the system architect, defining the metrics and standards that every other user follows.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 2.1 Essential Responsibilities</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Network Onboarding</strong> Registering new Organizations into the digital ecosystem.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Metric Governance</strong> Creating and defining the "Strategic Dimensions" (topics) of analysis.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Maturity Standards</strong> Defining what each "Digitalisation Level" represents.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Intelligence Rules</strong> Setting up the "Digitalisation Gaps" and expert "Recommendations".</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Global Oversight</strong> Monitoring the "Consolidated Report" for regional trends.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">User Provisioning</strong> Managing high-level administrative access.</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 2.2 Operational Flow: Setting the Foundation</h3>
                            <div className="space-y-5">
                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span> Onboarding a Regional Union (Organization)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Log in to the Admin Panel.</li>
                                        <li>Select <strong className="text-foreground">Organizations</strong> from the side navigation menu.</li>
                                        <li>Click the <strong className="text-foreground">Add Organization</strong> button.</li>
                                        <li><strong className="text-foreground">Enter Details:</strong> Provide the Organization Name, its official Domain (e.g., union-east.org), and a brief description.</li>
                                        <li><strong className="text-foreground">Invite Leadership:</strong> Once the organization is created, click Manage Users on its card and use the Invite User feature to register the first Organization Admin.</li>
                                        <li><strong className="text-foreground">Confirmation:</strong> Check the "Invite Pending" status to ensure the invitation was sent.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span> Designing the Analysis (Dimensions)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Navigate to the <strong className="text-foreground">Dimensions</strong> section in the Admin Panel.</li>
                                        <li>Click <strong className="text-foreground">Add Dimension</strong> to create a new area of measurement.</li>
                                        <li>Provide a clear, professional title and a description that explains why this area is critical for the cooperative's growth.</li>
                                        <li><strong className="text-foreground">Language Check:</strong> Click the language switcher (e.g., EN/FR) to provide translations for the dimension title if your region is multilingual.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span> Defining Maturity (Digitalisation Levels)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Stay in the Dimensions list. On each dimension card, click the <strong className="text-foreground">Manage Levels</strong> button.</li>
                                        <li>A dialog will appear asking you to choose between Current State and Desired State.</li>
                                        <li>Select <strong className="text-foreground">Current State</strong> first to define the 5 levels of current reality.</li>
                                        <li>Select <strong className="text-foreground">Desired State</strong> next to define the 5 levels of future goals.</li>
                                        <li><strong className="text-foreground">Action:</strong> For every level (Levels 1 to 5), provide a detailed description.<br />
                                            <span className="bg-muted p-2 rounded inline-block mt-2">Level 1: Usually represents "Manual/Analog operations."</span><br />
                                            <span className="bg-muted p-2 rounded inline-block mt-2 mb-2">Level 5: Represents "Full Digital Optimization."</span>
                                        </li>
                                        <li>This content is the "Ruler" used by every cooperative in the system.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span> Expert Advisory (Recommendations)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Go to the <strong className="text-foreground">Recommendations</strong> section.</li>
                                        <li>Click Add Recommendation.</li>
                                        <li>Select a Dimension and a Priority (Low, Medium, or High).</li>
                                        <li>Write the professional advice that a cooperative should follow to bridge a gap in this area.</li>
                                        <li><strong className="text-foreground">Tip:</strong> Use clear, actionable verbs like "Implement," "Train," "Procure," or "Audit."</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">5</span> Mapping Challenges (Digitalisation Gaps)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Navigate to the <strong className="text-foreground">Gaps</strong> section.</li>
                                        <li>Click Add Digitalisation Gap.</li>
                                        <li>Select a Dimension and a Severity (LOW, MEDIUM, HIGH).</li>
                                        <li>Provide a "Gap Description." <br /> <em className="bg-muted px-2 py-1 rounded inline-block mt-2">Example: "Your current core banking system lacks encryption (Dimension: Security, Severity: HIGH)."</em></li>
                                        <li>This description will appear in the cooperative's report when the system calculates a deficit.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 2.3 Monitoring the Global Ecosystem</h3>
                            <ul className="list-disc pl-6 space-y-3 text-muted-foreground bg-muted/30 p-5 rounded-xl border border-muted">
                                <li><strong className="text-foreground">Dashboard:</strong> A high-level overview of total Organizations, Users, and Submissions.</li>
                                <li><strong className="text-foreground">View Reports:</strong> Oversee the actual submissions from each Organization.</li>
                                <li><strong className="text-foreground">Consolidated Report:</strong> The "Master View." It aggregates all data to show which dimensions are consistently "High Risk" across the entire network.</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50/80 dark:bg-blue-900/20 p-6 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
                            <h4 className="font-bold text-lg mb-3 text-blue-800 dark:text-blue-300 flex items-center gap-2"><BarChart4 className="h-5 w-5" />2.4 Pro-Tips for Super Admins</h4>
                            <ul className="space-y-3 text-sm text-blue-900/80 dark:text-blue-200/80">
                                <li><strong className="text-blue-900 dark:text-blue-200">Standardize Descriptions:</strong> Use similar formatting for all Level 1-5 descriptions to make them easier for users to compare.</li>
                                <li><strong className="text-blue-900 dark:text-blue-200">Incremental Updates:</strong> You can update recommendations at any time without resetting the entire survey.</li>
                                <li><strong className="text-blue-900 dark:text-blue-200">Regional Filters:</strong> Use the search and filter tools in "View Reports" to compare the speed of digital adoption between different regional unions.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Level 2: Org Admin */}
            {isOrgAdminPath && (
                <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-8 border-b border-border/50">
                        <CardTitle className="flex items-center text-2xl">
                            <Users className="mr-3 h-7 w-7 text-primary" />
                            3. Level 2: The Organisation Admin (The Regional Union Lead)
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            The Organisation Admin manages their specific union’s digital journey by organizing their member cooperatives.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 3.1 Essential Responsibilities</h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Membership Mapping</strong> Building the list of "Cooperatives" in their union.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Team Management</strong> Inviting admins and staff for every local cooperative.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Assessment Leadership</strong> Designing and launching the "Assessment Cycles" for their branches.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Regional Analytics</strong> Reviewing the "Consolidated Report" for their specific union.</div>
                                <div className="p-4 border rounded-lg bg-card/50 sm:col-span-2 lg:col-span-1"><strong className="text-primary block mb-1">Strategic Reporting</strong> Generating PDF reports for external donors or auditors.</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 3.2 Operational Flow: Managing the Union Audit</h3>
                            <div className="space-y-5">
                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span> Mapping the Branches (Cooperatives)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Log in to the Organisation Admin panel.</li>
                                        <li>Select <strong className="text-foreground">Cooperatives</strong> from the sidebar.</li>
                                        <li>Click Add Cooperative.</li>
                                        <li>Enter the branch name (e.g., "Green Valley Coop") and a description.</li>
                                        <li>Once created, this cooperative can now be assigned assessments and users.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span> Delegating Responsibility (User Management)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Navigate to <strong className="text-foreground">Manage Users</strong>.</li>
                                        <li>Click Invite User.</li>
                                        <li><strong className="text-foreground">Enter Email:</strong> Provide the work email of the staff member.</li>
                                        <li><strong className="text-foreground">Assign Role:</strong><br />
                                            <ul className="list-disc pl-6 py-2">
                                                <li><strong className="text-foreground">Cooperative Admin:</strong> Has full control over the branch and its staff.</li>
                                                <li><strong className="text-foreground">Cooperative User:</strong> Focused primarily on answering assessments.</li>
                                            </ul>
                                        </li>
                                        <li><strong className="text-foreground">Linkage:</strong> Select the specific Cooperative branch they belong to. This is a critical security step.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span> Launching the Audit (Create Assessment)</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Go to the <strong className="text-foreground">Create Assessment</strong> section.</li>
                                        <li>Click Create Assessment.</li>
                                        <li><strong className="text-foreground">Basic Info:</strong> Enter an Assessment Name (e.g., "Q1 2026 Audit").</li>
                                        <li><strong className="text-foreground">Targeting:</strong> Select the Cooperative from the dropdown list.</li>
                                        <li><strong className="text-foreground">Scoping (Dimensions):</strong> Toggle the specific topics you want this cooperative to evaluate. You can select all or just a few (e.g., just "Cybersecurity" and "IT Infrastructure").</li>
                                        <li><strong className="text-foreground">Create:</strong> Save the assessment. It will initially appear as "Draft."</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 3.3 Monitoring Progress & Analysis</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="bg-muted p-5 rounded-xl border border-muted/80">
                                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><Activity className="w-5 h-5" /> Submissions</h4>
                                    <p className="text-muted-foreground mb-3 text-sm">Use this dashboard to track completion phases:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                                        <li><strong>Not Started:</strong> The cooperative has not opened the tool.</li>
                                        <li><strong>In Progress:</strong> Partial answers provided.</li>
                                        <li><strong>Completed:</strong> Ready for your review.</li>
                                    </ul>
                                </div>
                                <div className="bg-muted p-5 rounded-xl border border-muted/80">
                                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><BarChart4 className="w-5 h-5" /> Consolidated Report</h4>
                                    <p className="text-muted-foreground text-sm">Use the "Organization Digital Profile" charts to see which branches are trailing in digital adoption across the entire spectrum.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/80 dark:bg-blue-900/20 p-6 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
                            <h4 className="font-bold text-lg mb-3 text-blue-800 dark:text-blue-300 flex items-center gap-2"><BookOpen className="h-5 w-5" />3.4 Pro-Tips for Organisation Admins</h4>
                            <ul className="space-y-3 text-sm text-blue-900/80 dark:text-blue-200/80">
                                <li><strong className="text-blue-900 dark:text-blue-200">Phased Rolls:</strong> Launch assessments for 5 cooperatives at a time to manage your review capacity.</li>
                                <li><strong className="text-blue-900 dark:text-blue-200">Context is King:</strong> Encourage your cooperative managers to add images or documents as proof (if applicable) in their notes.</li>
                                <li><strong className="text-blue-900 dark:text-blue-200">Benchmarking:</strong> Use the "Comparison View" to show trailing cooperatives what the "High Performers" are doing correctly.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Level 3: Coop Admin */}
            {isCoopAdminPath && (
                <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-8 border-b border-border/50">
                        <CardTitle className="flex items-center text-2xl">
                            <Activity className="mr-3 h-7 w-7 text-primary" />
                            4. Level 3: The Cooperative Admin (The Branch Manager)
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            The Cooperative Admin ensures their local branch provides accurate and timely data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 4.1 Essential Responsibilities</h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Local Team Onboarding</strong> Managing their branch’s users.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Task Coordination</strong> Assigning specific "Dimensions" to their staff.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Quality Review</strong> Checking the branch’s answers and notes before final submission.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Strategy Review</strong> Assessing the branch’s "Action Plan."</div>
                                <div className="p-4 border rounded-lg bg-card/50 sm:col-span-2 lg:col-span-1"><strong className="text-primary block mb-1">Sign-off</strong> Technically "Finishing" the assessment once data is complete.</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 4.2 Tactical Operational Flow</h3>
                            <div className="space-y-5">
                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span> Local Staff Management</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Log in to the Cooperative Admin panel.</li>
                                        <li>Go to <strong className="text-foreground">Manage Users</strong>.</li>
                                        <li>Invite local experts (e.g., your IT lead or Finance Manager) to join the platform.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span> Overseeing the Audit</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Navigate to <strong className="text-foreground">Answer Assessment</strong>.</li>
                                        <li>The screen will display "Your Progress" as a progress bar.</li>
                                        <li>Monitor the "Dimension Cards." Each card will show if it is "Assigned" or "Completed."</li>
                                        <li>Ensure your staff adds detailed descriptions for every level selected.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span> Finalizing Results</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Once the progress bar reaches 100%, review the "Dimension Assessments" list.</li>
                                        <li>Go to <strong className="text-foreground">View Submissions</strong>.</li>
                                        <li>Open the latest submission to view the generated Risk Level (Low, Medium, or High).</li>
                                        <li>Click <strong className="text-foreground">Finish Assessment</strong> on the Assessment Detail page to officially submit the results to the Union Admin. This locks the data for that cycle.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            )}

            {/* Level 4: Coop User */}
            {isUserPath && (
                <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-8 border-b border-border/50">
                        <CardTitle className="flex items-center text-2xl">
                            <FileText className="mr-3 h-7 w-7 text-primary" />
                            5. Level 4: The Cooperative User (The Data Respondent)
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            The Cooperative User provides the foundational data that powers all system intelligence.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 5.1 Essential Responsibilities</h3>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Condition Reporting</strong> Honestly evaluating the "Current State" of their branch.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Goal Mapping</strong> Selecting the "Desired State" for future development.</div>
                                <div className="p-4 border rounded-lg bg-card/50"><strong className="text-primary block mb-1">Evidence Documentation</strong> Adding descriptive notes to support selections.</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center"><ChevronRight className="h-5 w-5 text-primary mr-1" /> 5.2 The Submission Flow: A Step-by-Step Guide</h3>
                            <div className="space-y-5">
                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span> Identifying Tasks</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Log in to the Cooperative User panel.</li>
                                        <li>Select <strong className="text-foreground">Answer Assessment</strong> from the sidebar.</li>
                                        <li>Select the active assessment. You will see a list of "Dimensions" assigned to you.</li>
                                        <li>Click <strong className="text-foreground">Start</strong> on the first topic.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl border-l-[6px] border-l-primary">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span> Evaluation & Analysis</h4>
                                    <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                                        <li><strong className="text-foreground">Selection:</strong> The system will display the five levels defined by the DGRV Admin. Read the descriptions carefully. Click the radio button for the level that matches your "Current Reality."</li>
                                        <li><strong className="text-foreground">Aspiration:</strong> Select the level representing your "Desired Goal" (where you want the cooperative to be in 12 months).</li>
                                        <li><strong className="text-foreground">Context (Notes):</strong> In the text box, provide qualitative evidence.<br />
                                            <em className="block mt-2 bg-muted p-2 rounded">Example 1: "Level 3 selected because we have a database, but it is not linked to our accounting software."</em>
                                            <em className="block mt-1 bg-muted p-2 rounded">Example 2: "Staff requires training on the new mobile app."</em>
                                        </li>
                                        <li><strong className="text-foreground">Save:</strong> Click <strong>Submit Assessment</strong>. The card for this topic will now turn green and show a "Completed" badge.</li>
                                    </ol>
                                </div>

                                <div className="bg-card border shadow-sm p-5 rounded-xl">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span> Action Planning</h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                                        <li>Navigate to the <strong className="text-foreground">Action Plan</strong> section (Kanban Board).</li>
                                        <li>The system will have already analyzed your answers and generated a set of "Action Items."</li>
                                        <li>Review these items with your supervisor to plan next month's tasks.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            )}

            {/* SECTIONS 6-12 (Globally Visible across roles) */}

            {/* Section 6: Intelligence Key */}
            <Card className="border-0 shadow-sm bg-muted/20 mt-8">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <BarChart4 className="h-6 w-6 text-primary" />
                        6. Understanding Results: The Intelligence Key
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-2">
                        The platform turns your inputs into strategic signals using a sophisticated "Gap Analysis" engine.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h4 className="font-bold text-lg text-foreground mb-4">6.1 Severity Levels (The Traffic Light System)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border border-green-500/20 bg-green-500/5 p-4 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <h5 className="font-bold text-green-700 dark:text-green-400">LOW</h5>
                                </div>
                                <strong className="block text-sm mb-1 text-foreground">Goal Achieved / Small Gap</strong>
                                <p className="text-sm text-muted-foreground">Your current state is very close to your target. Maintain standards.</p>
                            </div>
                            <div className="border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    <h5 className="font-bold text-yellow-700 dark:text-yellow-400">MEDIUM</h5>
                                </div>
                                <strong className="block text-sm mb-1 text-foreground">Progress Required</strong>
                                <p className="text-sm text-muted-foreground">A moderate gap exists. Plan for training or minor policy changes.</p>
                            </div>
                            <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <h5 className="font-bold text-red-700 dark:text-red-400">HIGH</h5>
                                </div>
                                <strong className="block text-sm mb-1 text-foreground">CRITICAL GAP</strong>
                                <p className="text-sm text-muted-foreground">Large deficit detected between reality and goal. Priority funding needed.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg text-foreground mb-4">6.2 Visualizing Your Profile</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 bg-card p-4 rounded-xl border shadow-sm">
                                <Activity className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-foreground block text-base mb-1">Maturity Radar Chart:</strong>
                                    <span className="text-sm text-muted-foreground">A geometric "shape" representing your branch's digital strength. A "balanced" shape indicates maturity in all dimensions.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 bg-card p-4 rounded-xl border shadow-sm">
                                <BarChart4 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-foreground block text-base mb-1">Risk Level Chart:</strong>
                                    <span className="text-sm text-muted-foreground">A bar chart quantifying high-priority threats across your selected topics.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="border-0 shadow-sm bg-muted/20 mt-8">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Book className="h-6 w-6 text-primary" />
                        7. Advanced Professional Features
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50/70 dark:bg-amber-900/10 p-5 rounded-xl border-l-4 border-amber-500 shadow-sm">
                        <h4 className="font-bold text-lg text-amber-800 dark:text-amber-300 mb-2">7.1 "Always-On" Offline Resiliency</h4>
                        <p className="text-sm text-muted-foreground mb-3 font-medium">The system is built for environments with unstable internet.</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900/80 dark:text-amber-200/80">
                            <li><strong>Offline Banner:</strong> A yellow/orange banner will appear at the top if your connection drops.</li>
                            <li><strong>Local Auto-Save:</strong> Your clicks and typing are stored in your browser's "Local Storage." You will NOT lose data if the internet cuts out while you are typing.</li>
                            <li><strong>Auto-Sync:</strong> The next time you log in with a stable connection, the system will compare your local work with the server and sync the most recent version.</li>
                        </ul>
                    </div>

                    <div className="bg-card border p-5 rounded-xl shadow-sm">
                        <h4 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2"><Download className="h-5 w-5 text-primary" /> 7.2 Professional Export (PDF Reports)</h4>
                        <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>Go to <strong>View Submissions</strong>.</li>
                            <li>Select a finished assessment.</li>
                            <li>Click <strong>Generate PDF</strong> or <strong>Export Report (Word)</strong>.</li>
                        </ol>
                        <p className="text-sm text-muted-foreground mt-3 bg-muted p-3 rounded">The system creates a branded document featuring your charts, your notes, and the DGRV expert recommendations. Use this for board meetings or loan applications.</p>
                    </div>

                    <div className="bg-card border p-5 rounded-xl shadow-sm">
                        <h4 className="font-bold text-lg text-foreground mb-2">7.3 Multi-Language Interface</h4>
                        <p className="text-sm text-muted-foreground mb-2">Select your preferred language at any time. This changes:</p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            <li>Sidebar navigation labels.</li>
                            <li>Buttons and status messages.</li>
                            <li>Professional level descriptions.</li>
                            <li>Generated Recommendation text.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Section 8: Mobile Installation */}
            <Card className="border-0 shadow-sm bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Smartphone className="h-6 w-6 text-primary" />
                        8. Mobile Installation (PWA Guide)
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-2">
                        The tool is a Progressive Web App (PWA) and can be "installed" on your mobile device for easy access.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-card p-5 rounded-xl border shadow-sm">
                        <h4 className="font-bold text-lg text-foreground mb-3">8.1 For Android (Chrome)</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>Open the app URL in Google Chrome.</li>
                            <li>Tap the three dots (Menu) in the top-right corner.</li>
                            <li>Select "Add to Home Screen" or "Install App."</li>
                            <li>The DGRV icon will now appear on your phone like a regular app.</li>
                        </ol>
                    </div>
                    <div className="bg-card p-5 rounded-xl border shadow-sm">
                        <h4 className="font-bold text-lg text-foreground mb-3">8.2 For iOS/iPhone (Safari)</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>Open the app URL in Safari.</li>
                            <li>Tap the "Share" button (square with an up arrow).</li>
                            <li>Scroll down and tap "Add to Home Screen."</li>
                            <li>Tap "Add" in the top-right corner.</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>

            {/* Section 9: Troubleshooting */}
            <Card className="border-0 shadow-sm bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        9. Troubleshooting & Common Scenarios
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-bold text-lg text-foreground mb-3">9.1 Technical Issues</h4>
                        <div className="space-y-3">
                            <div className="bg-card p-4 border rounded-xl shadow-sm">
                                <strong className="text-destructive flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> Issue: "I forgot my password."</strong>
                                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Solution:</span> Use the "Forgot Password" link on the login page to receive a recovery email.</p>
                            </div>
                            <div className="bg-card p-4 border rounded-xl shadow-sm">
                                <strong className="text-destructive flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> Issue: "The page is stuck loading."</strong>
                                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Solution:</span> Refresh your browser or clear your cache. Ensure your Organization Admin has not deactivated your account.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg text-foreground mb-3">9.2 Operational Issues</h4>
                        <div className="space-y-3">
                            <div className="bg-card p-4 border rounded-xl shadow-sm">
                                <strong className="text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4" /> Scenario: "I can't see any assessments assigned to me."</strong>
                                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Solution:</span> Contact your Cooperative Admin. They must first create an assessment and ensure your specific Cooperative is targeted.</p>
                            </div>
                            <div className="bg-card p-4 border rounded-xl shadow-sm">
                                <strong className="text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4" /> Scenario: "The 'Finish Assessment' button is grayed out."</strong>
                                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Solution:</span> Every single Dimension card must show a green "Completed" status. Ensure you didn't skip any assigned topics.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 10: Glossary */}
            <Card className="border-0 shadow-sm bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        10. Glossary of Technical Terms for Non-Technical Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <li className="bg-card border p-4 rounded-xl shadow-sm"><strong className="text-primary block text-sm mb-1 uppercase tracking-wide">Browser Cache</strong> <span className="text-sm text-muted-foreground">Temporary storage in your computer that helps pages load faster.</span></li>
                        <li className="bg-card border p-4 rounded-xl shadow-sm"><strong className="text-primary block text-sm mb-1 uppercase tracking-wide">Local Storage</strong> <span className="text-sm text-muted-foreground">A secure "safety net" on your device that remembers your assessment answers before they are uploaded.</span></li>
                        <li className="bg-card border p-4 rounded-xl shadow-sm"><strong className="text-primary block text-sm mb-1 uppercase tracking-wide">Sync</strong> <span className="text-sm text-muted-foreground">The process of matching the data on your phone/computer with the master DGRV database.</span></li>
                        <li className="bg-card border p-4 rounded-xl shadow-sm"><strong className="text-primary block text-sm mb-1 uppercase tracking-wide">Role-Based Access</strong> <span className="text-sm text-muted-foreground">The system only shows you the buttons and data relevant to your job.</span></li>
                        <li className="bg-card border p-4 rounded-xl shadow-sm"><strong className="text-primary block text-sm mb-1 uppercase tracking-wide">Encryption</strong> <span className="text-sm text-muted-foreground">A security method that keeps your cooperative's digital profile private and safe from hackers.</span></li>
                        <li className="bg-card border p-4 rounded-xl shadow-sm"><strong className="text-primary block text-sm mb-1 uppercase tracking-wide">Responsive Design</strong> <span className="text-sm text-muted-foreground">The ability of the website to change its layout to fit perfectly on a phone, tablet, or laptop.</span></li>
                    </ul>
                </CardContent>
            </Card>

            {/* Section 11 & 12 */}
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-sm bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">11. Sample Scenario: A Day in the Life</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 font-medium">To help you understand the flow, here is a typical journey for a Cooperative User named Sarah:</p>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground bg-card p-4 rounded-lg shadow-sm">
                            <li><strong className="text-foreground">Morning:</strong> Sarah receives an email invitation to the platform. She clicks the link and sets her password.</li>
                            <li><strong className="text-foreground">Dashboard:</strong> She logs in and sees her "Answer Assessment" menu. She sees one assessment named "Year-End Review."</li>
                            <li><strong className="text-foreground">Answering:</strong> She opens the "Digital Accounting" dimension. She reads Level 3: "Electronic records kept but not integrated." She realizes her branch fits this perfectly.</li>
                            <li><strong className="text-foreground">Goal Setting:</strong> She selects Level 5 as the goal for next year.</li>
                            <li><strong className="text-foreground">Notes:</strong> She types: "Working toward cloud integration by Q3."</li>
                            <li><strong className="text-foreground">Afternoon:</strong> She finishes all 5 dimensions. Her progress bar hits 100%.</li>
                            <li><strong className="text-foreground">Review:</strong> She opens the "View Action Plan" page and sees a recommendation to "Audit API access." She shares this with her manager.</li>
                            <li><strong className="text-foreground">Completion:</strong> Sarah's job is done for the cycle.</li>
                        </ol>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-muted/20">
                    <CardHeader>
                        <CardTitle className="text-xl">12. Conclusion: The Path to Digital Maturity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            This Operational Handbook (Version 7.0) is the definitive, code-verified guide for the DGRV Digital Gap Tool. By following the specific hierarchical flows outlined here, each user level contributes to a unified digital strategy.
                        </p>
                        <p>
                            From the architectural configuration of the Admin Panel to the tactical reporting in the Assessment Dashboard, every action you take is a step toward closing the gap between current challenges and a digitalized future.
                        </p>
                        <div className="mt-8 pt-6 border-t border-border/50 text-center">
                            <p className="font-semibold text-foreground uppercase tracking-widest text-xs">Official DGRV Platform Guidelines</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};
