class Board
  attr_accessor :space
  def initialize(cols=12, rows=12)
    @space = []
    rows.times do
      row = []
      cols.times do
        square = Square.new({:type => 'empty'}) #adds dependency. How to avoid?
        row.push square
      end
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

  def [](row, col)
    @space[row][col]
  end

#  def move(args = {'distance' => 1})
#    #this will take a bot, direction, and distance and move the bot
#    bot = args[bot]
#    start = bot.coords
#    direction = args.direction || bot.facing
#    distance = args.distance
#    distance.times do |move|
#      case direction
#      when 0
#        bot coords = @space[start[0]]([start[1]] + 1)
#      end
#    end
#  end

  def is_clear?
    #this will check with some Sqaures to see if movement or LoS is clear
  end

end

class Square
  attr_reader :type, :occupier
  def initialize(args)
    @type = args['type'] || 'empty'
    @occupier = nil
  end

  def to_s
    if is_empty?
      case @type
      when 'empty'            then '_'
      when 'gear'             then '*'
      when 'pit'              then '0'
      when 'conveyor'         then '-'
      when 'double_conveyor'  then '='
      when 'water'            then '~'
      else '^'
      end
    else
      @occupier.to_s
    end
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

board = Board.new()
twonky = Bot.new({:coords => board[0,0]})
twitch = Bot.new({:coords => board[5,3], :facing => 2})
twonky.turn_right
twitch.u_turn
puts board
board[5,0] << twonky
puts board
