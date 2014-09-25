class Board
  attr_accessor :space
  def initialize(cols=12, rows=12)
    @space = []
    rows.times do
      row = []
      cols.times do
        square = Square.new
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

end

class Square
  attr_reader :type, :occupier
  def initialize(type='empty')
    @type = type
    @occupier = nil
  end

  def to_s
    if is_empty?
      case type
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

  def is_empty?
    @occupier ? false : true
  end

  def occupier=(player)
    @occupier = player
    # seems like duplication to have each square know who is on it
    # and also have each robot know what square it's on.
    # But it makes sense that they each know these things.
  end

end

class Bot
  attr_reader :facing
  def initialize(coords, facing)
    @facing = facing
    @coords = coords
    coords.occupier=(self)
  end

  def to_s
    '&'
  end

  def move(distance=1, direction=@facing)

  end

  def turn(degrees)

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
twonky = Bot.new(board.space[0][0], 'south')
puts board
puts twonky
