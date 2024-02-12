import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import {
  Box,
} from '@mui/material'

const createData = () => {
  const formatTime = (d) => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
  const items = []
  for (let i = 0; i < 1500; i += 1) {
    const d = new Date()
    d.setMinutes(d.getMinutes() - (i * 30)).toLocaleString()
    items.push({
      datetime: formatTime(d),
      value: Math.floor(Math.random() * 99),
      i
    })
  }
  return items.sort((a, b) => b.i - a.i)
}

const width = 800
const height = 600
const mainHeight = 500
const scaleFactor = 100
const mainMargin = { top: 20, right: 0, bottom: 30, left: 40 }

function Index() {
  const data = createData()
  const svgRef = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width - mainMargin.left)
      .attr('height', height)
      .attr('style', 'max-width: 100%; height: auto;')
      .attr('transform', `translate(${mainMargin.left},0)`)

    const x = d3.scaleBand()
      .domain(data.map((v) => v.datetime))
      .range([mainMargin.left + mainMargin.right, width - mainMargin.right])
      .padding(0.2)
      .paddingOuter(1)
      .align(1)

    const y = d3.scaleLinear()
      .domain([0, 100])
      .nice()
      .range([mainHeight - mainMargin.bottom, mainMargin.top])

    const tooltip = d3.select(tooltipRef.current)

    const bars = svg.append('g')
      .attr('class', 'bars')
      .attr('fill', '#95CAFE')
      .attr('transform', `translate(${mainMargin.left},0)`)
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.datetime))
      .attr('y', (d) => y(Number(d.value)))
      .attr('height', (d) => y(0) - y(Number(d.value)))
      .attr('width', x.bandwidth())
      .on('mouseover', (e, d) => {
        tooltip
          .transition()
          .duration(0)
          .style('opacity', 1)
        tooltip
          .html(d.datetime + '<br/>value[%] ' + d.value)
          .style('top', (e.pageY - 80) + 'px')
          .style('left', (e.pageX + 30) + 'px')
      })
      .on('mousemove', (e) => {
        tooltip
          .style('top', (e.pageY - 80) + 'px')
          .style('left', (e.pageX + 30) + 'px')
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
      })

    const xAxis = d3.axisBottom(x)
      .tickSizeOuter(0)
      .tickFormat((v) => d3.timeFormat('%H:%M')(new Date(v)))

    const xAxisLine = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${mainMargin.left},${mainHeight - mainMargin.bottom})`)
      .call(xAxis)

    const yAxis = d3.axisLeft(y)
      .tickSizeInner(-width)
      .tickSizeOuter(mainMargin.left)

    const mainYAxis = yAxis
      .tickFormat((d) => {
        if (d !== 0 && d !== 100) {
          return d
        }
      })

    const extent = [
      [mainMargin.left, mainMargin.top],
      [width - mainMargin.right, mainHeight - mainMargin.top]
    ]

    const zoom = d3.zoom()
      .scaleExtent([scaleFactor, scaleFactor])
      .translateExtent(extent)
      .extent(extent)
      .on('zoom', (e) => {
        x.range(
          [mainMargin.left, width - mainMargin.right]
            .map(d => e.transform.applyX(d))
        )
        bars
          .attr('x', (d) => x(d.datetime))
          .attr('width', x.bandwidth())

        xAxisLine
          .call(xAxis)
      })

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${mainMargin.left},0)`)
      .call(mainYAxis)
      .attr('fill', 'white')

    svg.call(g => g.selectAll('.tick:not(:first-of-type) line')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-dasharray', '2,2'))

    svg
      .call(zoom)
      .call(zoom.scaleBy, scaleFactor, [width - mainMargin.right, mainHeight - mainMargin.top])

    const miniStart = mainHeight
    const miniEnd = mainHeight + 40
    const miniX = d3.scaleLinear()
      .domain([0, data.length])
      .range([mainMargin.left, width])

    const miniY = d3.scaleLinear()
      .domain([0, 100])
      .range([miniEnd, miniStart])

    svg.append('line')
      .attr('y1', mainHeight + 20)
      .attr('y2', mainHeight + 60)
      .attr('x1', mainMargin.left)
      .attr('x2', mainMargin.left)
      .attr('stroke', '#95CAFE')
      .attr('stroke-width', 1.5)

    svg.append('line')
      .attr('y1', mainHeight + 20)
      .attr('y2', mainHeight + 60)
      .attr('x1', width)
      .attr('x2', width)
      .attr('stroke', '#95CAFE')
      .attr('stroke-width', 1.5)

    svg.append('line')
      .attr('y1', mainHeight + 20)
      .attr('y2', mainHeight + 20)
      .attr('x1', mainMargin.left)
      .attr('x2', width)
      .attr('stroke', '#95CAFE')
      .attr('stroke-width', 1.5)

    svg.append('line')
      .attr('y1', mainHeight + 60)
      .attr('y2', mainHeight + 60)
      .attr('x1', mainMargin.left)
      .attr('x2', width)
      .attr('stroke', '#95CAFE')
      .attr('stroke-width', 1.5)

    const verticalLine = svg.append('line')
      .attr('opacity', 0)
      .attr('y1', mainHeight + 20)
      .attr('y2', mainHeight + 60)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('pointer-events', 'none')

    svg.append('rect')
      .attr('width', width)
      .attr('height', 60)
      .attr('opacity', 0)
      .attr('transform', `translate(40,${miniStart})`)
      .on('mousemove', (e) => {
        const pointer = d3.pointer(e)
        const xPos = pointer[0] + 40

        const i = Math.floor(miniX.invert(xPos))
        const d = data[i]

        verticalLine
          .attr('x1', xPos)
          .attr('x2', xPos)
          .attr('opacity', 1)

        tooltip
          .transition()
          .duration(0)
          .style('opacity', 1)
        tooltip
          .html(d.datetime + '<br/>value[%] ' + d.value)
          .style('top', (e.pageY - 80) + 'px')
          .style('left', (e.pageX + 30) + 'px')
        tooltip
          .style('top', (e.pageY - 80) + 'px')
          .style('left', (e.pageX + 30) + 'px')
      })
      .on('mouseout', function() {
        verticalLine.attr('opacity', 0)
        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
      })
      .on('click', (e) => {
        const pointer = d3.pointer(e)
        const xPos = pointer[0] + 40
        svg
          .transition()
          .duration(100)
          .call(zoom.translateTo, xPos, 0, [xPos, 0])
      })

    svg.append('path')
      .datum(data)
      .attr('transform', `translate(${mainMargin.left},${20})`)
      .attr('stroke-width', 20)
      .attr('d', d3.line()
        .x((d) => miniX(d.datetime))
        .y((d) => miniY(d.value))
      )


    return () => {
      svgRef.current = null
      tooltipRef.current = null
    }
  }, [svgRef.current])


  return (
    <>
      <svg id='chart' ref={svgRef} />
      <Box
        ref={tooltipRef}
        p={1}
        sx={{
          position: 'absolute',
          opacity: 0,
          border: 1,
          background: 'white',
        }}
      />
    </>
  )
}

export default Index
