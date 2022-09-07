create table messages(
  id SERIAL not null PRIMARY KEY,
  content varchar(255) not null,
  fileName varchar(255),
	sender int not null,
	receiver int not null,
  type varchar(10) not null,
  created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP not null
);