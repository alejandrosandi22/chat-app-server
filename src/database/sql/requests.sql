create table requests(
  id SERIAL not null PRIMARY KEY,
  content varchar(255) not null,
	sender int not null,
	receiver int not null,
  state BOOLEAN DEFAULT FALSE not null,
  response BOOLEAN DEFAULT null,
  created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP not null
);