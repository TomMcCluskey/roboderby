class Board
  attr_accessor :space
  def initialize(cols=12, rows=12)
    @space = []
    y = 0
    x = 0
    rows.times do
      row = []
      cols.times do
        square = Square.new({:type => 'empty'})
        square.y = y
        square.x = x
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
  attr_reader :type, :occupier, :x, :y, :walls
  def initialize(args)
    @type = args['type'] || 'empty'
    @walls = args['walls'] || []
    @occupier = nil
  end

  # just in case you want to play roborally on the command line, I guess
  def to_s
    if is_empty?
      case @type
      when 'empty'            then '_'
      when 'gear'             then '*'
      when 'pit'              then '0'
      when 'conveyor'         then '-'
      when 'double_conveyor'  then '='
      when 'water'            then '~'
      else '?'
      end
    else
      @occupier.to_s
    end
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
  attr_accessor :coords
  def initialize(args)
    @facing = args[:facing] || 0
    @coords = args[:coords]
    @coords.occupier = self
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

  end

  def shoot(laser=true)

  end

  def is_virtual?

  end

end

class Move_card

end

# board = Board.new
# twonky = Bot.new({:coords => board[0,0]})
# twitch = Bot.new({:coords => board[5,3], :facing => 2})
# twonky.turn_right
# twitch.u_turn
# puts board
# board.move({'bot' => twonky, 'distance' => 3})
# puts board
