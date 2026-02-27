declare module "pg" {
	export interface QueryResultRow {
		// minimal marker interface for typed query rows
	}

	export interface QueryResult<R extends QueryResultRow = QueryResultRow> {
		rows: R[];
		rowCount: number | null;
	}

	export class PoolClient {
		query<R extends QueryResultRow = QueryResultRow>(
			text: string,
			values?: unknown[]
		): Promise<QueryResult<R>>;
		release(): void;
	}

	export class Pool {
		constructor(config?: { connectionString?: string });
		query<R extends QueryResultRow = QueryResultRow>(
			text: string,
			values?: unknown[]
		): Promise<QueryResult<R>>;
		connect(): Promise<PoolClient>;
	}
}
