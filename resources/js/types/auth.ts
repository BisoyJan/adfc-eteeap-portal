export type UserRole = 'super_admin' | 'admin' | 'evaluator' | 'applicant';

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Permissions = {
    manage_users: boolean;
    manage_portfolios: boolean;
    evaluate_portfolios: boolean;
    submit_portfolios: boolean;
    manage_rubrics: boolean;
    manage_system: boolean;
};

export type Auth = {
    user: User;
    permissions: Permissions;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
