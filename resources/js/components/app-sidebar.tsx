import { Link, usePage } from '@inertiajs/react';
import { BarChart3, BookOpen, ClipboardCheck, ClipboardList, FileStack, Folder, FolderOpen, LayoutGrid, Users } from 'lucide-react';
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

function getNavItems(role: UserRole): NavItem[] {
    if (role === 'admin' || role === 'super_admin') {
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
                title: 'Reports',
                href: '/admin/reports',
                icon: BarChart3,
            },
        ];
    }

    const items: NavItem[] = [
        {
            title: 'Dashboard',
            href: role === 'applicant' ? '/applicant/dashboard' : role === 'evaluator' ? '/evaluator/dashboard' : dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (role === 'applicant') {
        items.push({
            title: 'My Portfolios',
            href: '/applicant/portfolios',
            icon: FolderOpen,
        });
    }

    if (role === 'evaluator') {
        items.push({
            title: 'Assigned Reviews',
            href: '/evaluator/portfolios',
            icon: ClipboardCheck,
        });
    }

    return items;
}

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const navItems = getNavItems(auth.user.role);

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
