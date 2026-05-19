import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CalendarRange,
    ClipboardCheck,
    ClipboardList,
    FileStack,
    Folder,
    FolderOpen,
    GraduationCap,
    LayoutGrid,
    Library,
    Mail,
    Megaphone,
    ScrollText,
    Users,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, SharedData, UserRole } from '@/types';
import AppLogo from './app-logo';

function getNavItems(role: UserRole, unreadMessageCount: number): NavItem[] {
    if (role === 'admin') {
        return [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Manage Portfolios',
                href: '/admin/portfolios',
                icon: Folder,
            },
            {
                title: 'Manage Users',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Academic Years',
                href: '/admin/academic-years',
                icon: CalendarRange,
            },
            {
                title: 'Subjects',
                href: '/admin/subjects',
                icon: BookOpen,
            },
            {
                title: 'Rubric Criteria',
                href: '/admin/rubrics',
                icon: ClipboardList,
            },
            {
                title: 'Document Categories',
                href: '/admin/document-categories',
                icon: FileStack,
            },
            {
                title: 'Announcements',
                href: '/admin/announcements',
                icon: Megaphone,
            },
            {
                title: 'Reports',
                href: '/admin/reports',
                icon: BarChart3,
            },
            {
                title: 'Activity Logs',
                href: '/admin/activity-logs',
                icon: ScrollText,
            },
            {
                title: 'Messages',
                href: '/messages/inbox',
                icon: Mail,
                badge: unreadMessageCount,
            },
        ];
    }

    const items: NavItem[] = [
        {
            title: 'Dashboard',
            href:
                role === 'applicant'
                    ? '/applicant/dashboard'
                    : role === 'evaluator'
                        ? '/evaluator/dashboard'
                        : dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (role === 'applicant') {
        items.push({
            title: 'My Portfolios',
            href: '/applicant/portfolios',
            icon: FolderOpen,
        });
        items.push({
            title: 'My Subjects',
            href: '/applicant/subjects',
            icon: Library,
        });
        items.push({
            title: 'My Grades',
            href: '/applicant/grades',
            icon: GraduationCap,
        });
        items.push({
            title: 'Announcements',
            href: '/applicant/announcements',
            icon: Megaphone,
        });
    }

    if (role === 'evaluator') {
        items.push({
            title: 'Assigned Reviews',
            href: '/evaluator/portfolios',
            icon: ClipboardCheck,
        });
        items.push({
            title: 'Subject Assignments',
            href: '/evaluator/subjects',
            icon: Library,
        });
        items.push({
            title: 'Announcements',
            href: '/evaluator/announcements',
            icon: Megaphone,
        });
    }

    items.push({
        title: 'Messages',
        href: '/messages/inbox',
        icon: Mail,
        badge: unreadMessageCount,
    });

    return items;
}

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const navItems = getNavItems(auth.user.role, auth.unreadMessageCount);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
