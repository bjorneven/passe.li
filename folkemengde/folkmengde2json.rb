#!/usr/bin/ruby
# encoding: UTF-8

require 'english'
require 'csv'
require 'json'
require 'fileutils'

def read_stuff
  options = {:encoding => 'iso-8859-1', :skip_blanks => true,:col_sep=> ';'}

  prognosis = Hash.new

  CSV.foreach('./fremskrevet-folkemengde.csv',options,) do |row|
    next if $INPUT_LINE_NUMBER == 1

    if prognosis[row[3]] == nil
      prognosis[row[3]] = Hash.new

    end

    per_year = prognosis[row[3]]

    if per_year[row[4]] == nil
      per_year[row[4]] = [[row[1],row[2],row[3],row[5]]]
    else
      per_year[row[4]].push([row[1],row[2],row[3],row[5]])

    end

  end
  return prognosis
end

def create_dir(prognosis)
  prognosis.each do |key,value|
    FileUtils.mkdir_p "data/#{key.encode('UTF-8')}", :verbose => true

  end

end
def generate(prognosis)
  prognosis.each do |prog_key,prog_value|

    prog_value.each do |key,value|


      file = File.open("data/#{prog_key.encode('UTF-8')}/#{ key }.json","w")
      file.write(JSON.pretty_generate(value))
    end
  end

end

prognosis = read_stuff
create_dir prognosis
generate prognosis

