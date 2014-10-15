require 'sinatra'
require 'slim'
require './game.rb'

get '/' do
  @board = Board.new
  slim :index
end
