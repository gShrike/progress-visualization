import numpy as np
import pandas as pd

from bokeh.io import curdoc
from bokeh.plotting import figure
from bokeh.resources import CDN
from bokeh.embed import file_html
from bokeh.layouts import column, widgetbox
from bokeh.models import ColumnDataSource, HoverTool
from bokeh.models.widgets import DataTable, TableColumn

def format_data(students):
    data = dict(categories=[], maximums=[], minimums=[], q1_scores=[], q2_scores=[], q3_scores=[])
    total_intervals = 100/len(students['intervals'])
    for i, interval in enumerate(students['intervals']):
        data['categories'].append(str(int(total_intervals * (i + 1))) + '%')
        if interval['median'] is not 0:
            data['q1_scores'].append(interval['q1'])
            data['q2_scores'].append(interval['median'])
            data['q3_scores'].append(interval['q3'])
            data['maximums'].append(interval['max'])
            data['minimums'].append(interval['min'])
        # Whisker at 1.5 IQR - Disabled
        #  whisker_max = interval['q3'] + 1.5*interval['iqr']
        #  whisker_min = interval['q1'] - 1.5*interval['iqr']
        #  whisker_min = whisker_min if whisker_min > 0 else 0
        #  data['maximums'].append(interval['max'] if interval['max'] > whisker_max else whisker_max)
        #  data['minimums'].append(interval['min'] if interval['min'] < whisker_min else whisker_min)
    return data

def get_student_data(student):
    return list(map(lambda interval: len(interval['assessments']), student['progress']))

def draw(students, student):
    data = format_data(students) 

    hover = HoverTool(tooltips=[
        ("Standards", "$y"),
    ])

    p = figure(tools=[hover,"save"], background_fill_color="#F4F3FB", title="Student Assessment Progress", x_range=data['categories'])

    # stems
    p.segment(data['categories'], data['maximums'], data['categories'], data['q3_scores'], line_color="black")
    p.segment(data['categories'], data['minimums'], data['categories'], data['q1_scores'], line_color="black")
    
    # boxes
    p.vbar(data['categories'], 0.7, data['q2_scores'], data['q3_scores'], fill_color="#BE69CA", line_color="black")
    p.vbar(data['categories'], 0.7, data['q1_scores'], data['q2_scores'], fill_color="#40977F", line_color="black")
    
    # whiskers (almost-0 height rects simpler than segments)
    p.rect(data['categories'], data['minimums'], 0.2, 0.01, line_color="black")
    p.rect(data['categories'], data['maximums'], 0.2, 0.01, line_color="black")
    
    p.xgrid.grid_line_color = None
    p.ygrid.grid_line_color = "white"
    p.grid.grid_line_width = 2
    p.xaxis.major_label_text_font_size="8pt"
    p.xaxis.axis_label = '% Program'
    p.yaxis.axis_label = '# Standards Completed'

    table_data = dict(
        progress=data['categories'],
        standards=data['q2_scores'],
    )
    columns = [
        TableColumn(field="progress", title="Progress"),
        TableColumn(field="standards", title="Median Standards")
    ]

    # draw student line
    if student and student in students:
        student_data = get_student_data(students[student])
        program_progress = data['categories'][:len(student_data)]
        p.line(program_progress, student_data, color='#FF822D')
        table_data['student_standards'] = student_data
        columns.append(TableColumn(field="student_standards", title="Student Standards"))

    source = ColumnDataSource(table_data)
    data_table = DataTable(source=source, columns=columns, width=400, height=280)
    inputs = widgetbox(data_table)

    curdoc().clear()
    curdoc().add_root(column(p, inputs, width=1000))

    return file_html(curdoc(), CDN, "student assessment progress")
