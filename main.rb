require 'sinatra'
require 'slim'
require './game.rb'
require 'uuid'
require 'warden' # for auth
require 'json'
require 'sinatra-websocket'

set :sockets, []

use Rack::Session::Cookie # for auth

configure do
  enable :sessions
end

before do
  # @guid is used with etag to ensure refresh on page change
  @guid = UUID.new.generate
end

get '/board/' do
  puts params
  etag @guid
  @board = Board.new(params[:board])
  # puts @board
  @twonky = Bot.new({:coords => @board[0,0]})
  slim :board
end

get '/' do
  slim :index
end

get '/new_game' do
  slim :new_game
end

get '/socket/' do
  if !request.websocket?
    puts 'not socketed :('
    slim :socket
  else
    puts 'socketed!'
    request.websocket do |ws|
      ws.onopen do
        ws.send("Hello World!")
        settings.sockets << ws
      end
      ws.onmessage do |msg|
        EM.next_tick { settings.sockets.each{|s| s.send(msg) } }
      end
      ws.onclose do
        warn("websocket closed")
        settings.sockets.delete(ws)
      end
    end
  end
end

post '/api/turnSubmission/' do
  puts 'turn submitted'
  turn_submission = params
  puts turn_submission
end

post '/api/login/' do
  puts "Hey, a login attempt!"
  "Name: #{params[:username]}; Password: #{params[:password]}"
end
