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
                             pusher: cell['invisibles']['pusher'],
                             special: cell['special']})
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
    # sample call: move( {bot: self, direction: 1, distance: 2} )
    bot = args[:bot]
    direction = args[:direction] || bot.facing
    distance = args[:distance] || 1
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

  def turn(args)
    # sample call: turn( {bot: self, direction: 'left'} )
    direction = args[:direction]
    bot = args[:bot]
    case direction
    when 'right'
      bot.facing = (bot.facing + 1) % 4
    when 'u_turn'
      bot.facing = (bot.facing + 2) % 4
    when 'left'
      bot.facing = (bot.facing + 3) % 4
    end
  end

  def north_of(square)
    x = square.x
    y = square.y
    self[x, y-1]
  end

  def east_of(square)
    x = square.x
    y = square.y
    self[x+1, y]
  end

  def south_of(square)
    x = square.x
    y = square.y
    self[x, y+1]
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
  attr_reader :type, :facing, :occupier, :x, :y, :walls, :laser, :pusher, :spawn
  def initialize(args)
    @type = args[:type] || 'empty'
    @facing = args[:facing] || 0
    @walls = args[:walls] || []
    @occupier = nil
    @laser = args[:laser] || nil
    @pusher = args[:pusher] || nil
    @spawn = (args[:special] =~ /(spawn\d)/) ? $1 : nil
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
    @board = args[:board] #this seems... suboptimal
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
    phase -= 1
    # puts "phase #{phase}: #{@register[phase]}"
    case @register[phase][:value]
    when 'Rotate Left' then @board.turn({bot: self, direction: 'left'})
    when 'Rotate Right' then @board.turn({bot: self, direction: 'right'})
    when 'U Turn' then @board.turn({bot: self, direction: 'u_turn'})
    when 'Move 1' then @board.move({bot: self})
    when 'Move 2' then @board.move({bot: self, distance: 2})
    when 'Move 3' then @board.move({bot: self, distance: 3})
    when 'Back Up' then @board.move({bot: self, distance: 1, direction: (@facing + 2) % 4})
    end
  end

  def get_cards(deck)
    (@max_hand - @hand.length).times { deck.draw(self) }
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

  def program
    # take in an array of chosen cards & assign them to registers
    # for now, this just plays random cards
    (@max_hand >= 5 ? 5 : @max_hand).times do
      @register.push(@hand.pop)
    end
  end

  def facing= (direction)
    @facing = direction
  end

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
    # self.shuffle
  end

  def shuffle
    # puts @cards
    @cards.shuffle!
    # puts "****************"
    # puts @cards
  end

  def draw
    @cards.pop
  end

end

class Game

  def initialize(args)
    # master object
    @PHASE_COUNT = 5
    @bots = args[:bots]
    @deck = Deck.new
    @board = args[:board]
    @winner = nil
    @moves = []
    # take_turn
  end

  def take_turn
    # replaces the unneccesary Turn class
    @bots.each do |bot|
      bot.fill_hand(@deck)
      bot.program
    end
    phase = 1
    @PHASE_COUNT.times do
      @bots.each { |bot| bot.execute(phase) } #testing only
      phase += 1
      # puts @board
    end
    @winner = "Tom!"
    take_turn unless @winner
  end

  def collect_moves(submission)
    @moves.push(submission)
    if @moves.length >= @bots.length do
      # program bots
    end 
    puts submission
    else
    end
  end

end

def go
  moves = Deck.new
  moves.shuffle
  board = Board.new
  # puts board
  twonky = Bot.new({:coords => board[6,6], board: board})
  # puts board
  game = Game.new({ bots: [twonky], board: board})
  game.take_turn
  # twonky.get_cards(moves)
  # puts twonky.hand
  # twitch = Bot.new({:coords => board[5,3], :facing => 2})
  # board.move({'bot' => twonky, 'distance' => 3})
  # puts board
end

go
