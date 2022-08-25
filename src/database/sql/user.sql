create database chat_app;

create table users(
  id SERIAL not null PRIMARY KEY,
  name varchar(255) not null,
  email varchar(255) not null UNIQUE,
  username varchar(255) not null UNIQUE,
  password varchar(255) not null,
  avatar varchar(255) not null,
  cover_photo varchar(255), 
  description varchar(255) not null,
  website varchar(255),
  show_profile_photo varchar(20) DEFAULT 'public' not null,
  contacts_request varchar(20) DEFAULT 'everybody' not null,
  contacts integer[] not null,
  provider varchar(20) not null,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null
)