require 'sinatra'
require 'slim'
require './game.rb'

get '/' do
  @board = Board.new(params[:board])
  puts @board
  @twonky = Bot.new({:coords => @board[0,0]})
  slim :index
end
