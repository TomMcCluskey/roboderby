require 'json'

class Board
  attr_reader :lasers
  attr_accessor :space

  def initialize(board_name='maelstrom')
    #new initialize
    board = JSON.parse(File.read('public/boards.json'))[board_name]
    @space = []
    @lasers = []
    y = 0
    x = 0
    board['rows'].each do |data_row|
      row = []
      data_row.each do |cell|
        square = Square.new({type: cell['type'],
                             facing: cell['facing'],
                             walls: cell['walls'],
                             laser: cell['invisibles']['laser'],
                             pusher: cell['invisibles']['pusher']})
        square.x = x
        square.y = y
        row.push square
        x += 1
      end
      y += 1
      x = 0
      @space.push row
    end
  end

  def to_s
    @space.each do
      |row| row.each do
        |cell| print cell.to_s
      end
      print "\n"
    end
  end

  def [](col, row)
    @space[row][col] #this method bears examination
  end

  def move(args)
    #this will take a bot, direction, and distance and move the bot
    bot = args['bot']
    direction = args['direction'] || bot.facing
    distance = args['distance'] || 1
    distance.times do |move|
      start = bot.coords
      case direction
      when 0
        north_of(bot.coords) << bot
      when 1
        east_of(bot.coords) << bot
      when 2
        south_of(bot.coords) << bot
      when 3
        west_of(bot.coords) << bot
      end
      start.occupier = nil #will cause problems when running into walls
    end
  end

  def north_of(square)
    x = square.x
    y = square.y
    self[x, y+1]
  end

  def east_of(square)
    x = square.x
    y = square.y
    self[x+1, y]
  end

  def south_of(square)
    x = square.x
    y = square.y
    puts self[x, y-1]
    self[x, y-1]
  end

  def west_of(square)
    x = square.x
    y = square.y
    self[x-1, y]
  end

  def path_to?
    #this will check with some Sqaures to see if movement is clear
  end

end

class Square

  # Example Square: Square.new( {type => :gear, walls => [ :north, :south ]} )
  attr_reader :type, :facing, :occupier, :x, :y, :walls, :laser, :pusher
  def initialize(args)
    @type = args[:type] || 'empty'
    @facing = args[:facing] || 0
    @walls = args[:walls] || []
    @occupier = nil
    @laser = args[:laser] || nil
    @pusher = args[:pusher] || nil
  end

  # just in case you want to play roborally on the command line, I guess
  def to_s
    if is_empty?
      case @type
      when 'empty'            then '_'
      when 'gear'             then '*'
      when 'pit'              then '0'
      when 'slow_conveyor'    then '-'
      when 'fast_conveyor'    then '='
      when 'wrench1'          then '/'
      when 'wrench2'          then 'X'
      when 'water'            then '~'
      else '?'
      end
    else
      @occupier.to_s
    end
  end

  def inspect
    "{type: #{@type}; facing: #{@facing}; walls: #{@walls}; occupier: #{@occupier}; laser: #{@laser}; pusher: #{@pusher}}"
  end

  def x=(x)
    @x = x
  end

  def y=(y)
    @y = y
  end

  def <<(bot)
    @occupier = bot
    bot.coords = self
  end

  def remove(bot)
    bot.coords = nil
    @occupier = nil
  end

  def is_empty?
    @occupier ? false : true
  end

  def occupier=(piece)
    @occupier = piece
  end

end

class Bot
  attr_reader :facing
  attr_accessor :coords, :hand
  def initialize(args)
    @facing = args[:facing] || 0
    @coords = args[:coords]
    @coords.occupier = self
    @damage = 0
    @register = [] #holds move cards
    @max_hand = 9
    @hand = []
  end

  def to_s
    case @facing
    when 0 then '^'
    when 1 then '>'
    when 2 then 'v'
    when 3 then '<'
    else '?'
    end
  end

  def execute(phase)
    case @register[phase]
    when 'Rotate Left' then self.turn_left
    when 'Rotate Right' then self.turn_right
    when 'U Turn' then self.u_turn
    when 'Move 1' then #currently move is in Board
    when 'Move 2' then #currently move is in Board
    when 'Move 3' then #currently move is in Board
    when 'Back Up' then #currently move is in Board
    end
  end

  def get_cards(deck)
    (@max_hand - @hand.length).times { deck.draw(self) }
  end

  def turn_right
    @facing = (@facing + 1) % 4
  end

  def turn_left
    @facing = (@facing + 3) % 4
  end

  def u_turn
    @facing = (@facing + 2) % 4
  end

  def take_damage(amount=1)
    @damage += amount
    @max_hand -= amount
    # also lock registers, check for destruction
  end

  def shoot(laser=true)

  end

  def is_virtual?

  end

  def fill_hand(deck)
    # gets called by Game, calls Deck with # of cards needed
    (@max_hand - @hand.length).times do
      @hand.push(deck.draw)
    end
  end

#  def program(choices)
#    # take in an array of chosen cards & assign them to registers
#  end

end

class Deck
  attr_reader :cards

  def initialize
    @cards = []
    deck_data = File.read("public/moves.json")
    counter = 10
    JSON.parse(deck_data).each do |cardname|
      card = { sequence: counter, value: cardname }
      @cards.push card
      counter += 10
    end
    self.shuffle
  end

  def shuffle
    @cards.shuffle!
  end

  def draw
    @cards.pop
  end

end

class Game

  def initialize(args)
    # master object
    @bots = args[:bots]
    @deck = Deck.new
    @board = args[:board]
    @winner = nil
    take_turn
  end

  def take_turn
    # replaces the unneccesary Turn class
    @bots.each do |bot|
      bot.fill_hand(@deck)
      # bot.program(choices)
      puts bot.hand
    end
    @winner = "Tom!"
    take_turn unless @winner
  end

end

moves = Deck.new
board = Board.new
# puts board
twonky = Bot.new({:coords => board[0,0]})
game = Game.new({ bots: [twonky], board: board})
# twonky.get_cards(moves)
# puts twonky.hand
# twitch = Bot.new({:coords => board[5,3], :facing => 2})
# twonky.turn_right
# twitch.u_turn
# puts board
# board.move({'bot' => twonky, 'distance' => 3})
# puts board
