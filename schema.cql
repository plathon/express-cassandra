CREATE table users (
	id uuid PRIMARY KEY,
	slug text,
	name text,
	email text,
	password text,
	language text,
	avatar text,
	created_at timestamp,
	updated_at timestamp,
	facebook text,
	twitter text,
	google text,
	status int,
	reset_password text
);
CREATE INDEX ON users (slug);
CREATE INDEX ON users (email);
CREATE INDEX ON users (facebook);
CREATE INDEX ON users (twitter);
CREATE INDEX ON users (google);
CREATE INDEX ON users (reset_password);