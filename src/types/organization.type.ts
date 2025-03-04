export interface Organization {
    client_rate?: number | null
    created_at?: string | null
    hourly_rate?: number | null
    id?: string
    knowledge_base?: string | null
    name: string
    services?: string[] | null
    updated_at?: string | null
}