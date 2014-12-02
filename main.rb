require 'sinatra'
require 'slim'
require './game.rb'
require 'uuid'
require 'warden' # for auth

use Rack::Session::Cookie # for auth

configure do
  enable :sessions
end

before do
  # @guid is used with etag to ensure refresh on page change
  @guid = UUID.new.generate
end

get '/board/' do
  etag @guid
  @board = Board.new(params[:board])
  puts @board
  @twonky = Bot.new({:coords => @board[0,0]})
  slim :board
end

get '/' do
  slim :index
end

post '/api/login/' do
  puts "Hey, a login attempt!"
  "Name: #{params[:username]}; Password: #{params[:password]}"
end
