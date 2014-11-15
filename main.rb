require 'sinatra'
require 'slim'
require './game.rb'

get '/' do
  @board = Board.new
  puts @board
  @twonky = Bot.new({:coords => @board[0,0]})
  slim :index
end
